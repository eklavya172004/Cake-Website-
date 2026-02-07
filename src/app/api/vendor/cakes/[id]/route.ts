import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db/client';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cakeId = id;

    // Get account and vendor info
    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
    });

    if (!account || account.role !== 'vendor' || !account.vendorId) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 401 }
      );
    }

    // Get the cake and verify ownership
    const cake = await prisma.cake.findUnique({
      where: { id: cakeId },
    });

    if (!cake) {
      return NextResponse.json(
        { error: 'Cake not found' },
        { status: 404 }
      );
    }

    if (cake.vendorId !== account.vendorId) {
      return NextResponse.json(
        { error: 'You can only view your own cakes' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ...cake,
      basePrice: parseFloat(cake.basePrice.toString()),
    });
  } catch (error) {
    console.error('Cake fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cake', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cakeId = id;

    // Get account and vendor info
    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
    });

    if (!account || account.role !== 'vendor' || !account.vendorId) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 401 }
      );
    }

    // Get the cake and verify ownership
    const cake = await prisma.cake.findUnique({
      where: { id: cakeId },
    });

    if (!cake) {
      return NextResponse.json(
        { error: 'Cake not found' },
        { status: 404 }
      );
    }

    if (cake.vendorId !== account.vendorId) {
      return NextResponse.json(
        { error: 'You can only edit your own cakes' },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // Get text fields (only required ones)
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const cakeType = formData.get('cakeType') as string | null;
    const basePrice = formData.get('basePrice') as string;
    const flavorsStr = formData.get('flavors') as string;
    const toppingsStr = formData.get('toppings') as string;
    const tagsStr = formData.get('tags') as string;
    const availableSizesStr = formData.get('availableSizes') as string;
    const isCustomizable = formData.get('isCustomizable') === 'true';

    // Get image files
    const imageFiles = formData.getAll('images') as File[];

    // Handle image upload if new images provided
    let uploadedImages = cake.images;

    if (imageFiles.length > 0) {
      // Validate image count (total existing + new)
      const totalImages = cake.images.length - (imageFiles.length > 0 ? 0 : 0) + imageFiles.length;
      if (totalImages > 4) {
        return NextResponse.json(
          { error: 'Maximum 4 images allowed per cake' },
          { status: 400 }
        );
      }

      uploadedImages = [];

      // Upload new images
      for (const imageFile of imageFiles) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `cake-shop/vendors/${account.vendorId}/cakes`,
              resource_type: 'auto',
              quality: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        const cloudinaryResult = result as { secure_url: string };
        uploadedImages.push(cloudinaryResult.secure_url);
      }
    }

    // Prepare update data
    interface UpdateData {
      name?: string;
      description?: string;
      category?: string;
      cakeType?: string | null;
      basePrice?: number;
      flavors?: string[];
      tags?: string[];
      customOptions?: Record<string, string[]>;
      availableSizes?: { size: string; price: number }[];
      isCustomizable?: boolean;
      images?: string[];
    }
    
    const updateData: UpdateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (cakeType !== null) updateData.cakeType = cakeType || null;
    if (basePrice) updateData.basePrice = parseFloat(basePrice);
    if (flavorsStr) updateData.flavors = JSON.parse(flavorsStr);
    if (tagsStr) updateData.tags = JSON.parse(tagsStr);
    if (toppingsStr) {
      const customOptions = (cake.customOptions as Record<string, unknown>) || {};
      updateData.customOptions = {
        ...customOptions,
        toppings: JSON.parse(toppingsStr),
      };
    }
    if (availableSizesStr) updateData.availableSizes = JSON.parse(availableSizesStr);
    updateData.isCustomizable = isCustomizable;

    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages;
    }

    // Update cake
    const updatedCake = await prisma.cake.update({
      where: { id: cakeId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Cake updated successfully',
      cake: {
        id: updatedCake.id,
        name: updatedCake.name,
        category: updatedCake.category,
        basePrice: parseFloat(updatedCake.basePrice.toString()),
        images: updatedCake.images,
      },
    });
  } catch (error) {
    console.error('Cake update error:', error);
    return NextResponse.json(
      { error: 'Failed to update cake', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cakeId = id;

    // Get account and vendor info
    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
    });

    if (!account || account.role !== 'vendor' || !account.vendorId) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 401 }
      );
    }

    // Get the cake and verify ownership
    const cake = await prisma.cake.findUnique({
      where: { id: cakeId },
    });

    if (!cake) {
      return NextResponse.json(
        { error: 'Cake not found' },
        { status: 404 }
      );
    }

    if (cake.vendorId !== account.vendorId) {
      return NextResponse.json(
        { error: 'You can only delete your own cakes' },
        { status: 403 }
      );
    }

    // Delete images from Cloudinary
    if (cake.images && cake.images.length > 0) {
      for (const imageUrl of cake.images) {
        try {
          // Extract public_id from URL
          const publicId = imageUrl
            .split('/')
            .slice(-2)
            .join('/')
            .replace(/\.[^.]+$/, '');
          
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
          // Continue even if deletion fails
        }
      }
    }

    // Delete cake from database
    await prisma.cake.delete({
      where: { id: cakeId },
    });

    return NextResponse.json({
      success: true,
      message: 'Cake deleted successfully',
    });
  } catch (error) {
    console.error('Cake delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete cake', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
