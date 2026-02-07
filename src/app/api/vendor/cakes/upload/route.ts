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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('🍰 Cake Upload - Session:', { email: session?.user?.email, role: (session?.user as any)?.role });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get account and vendor info
    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
      select: { email: true, role: true, vendorId: true, id: true },
    });

    console.log('🍰 Cake Upload - Account lookup:', {
      email: session.user.email,
      found: account !== null,
      account: account ? JSON.stringify(account) : 'null'
    });

    if (!account) {
      console.log('🍰 Cake Upload - Account not found in database for email:', session.user.email);
      return NextResponse.json(
        { error: 'Account not found in database' },
        { status: 401 }
      );
    }

    if (account.role !== 'vendor') {
      console.log('🍰 Cake Upload - Account role is not vendor:', account.role);
      return NextResponse.json(
        { error: 'Account is not a vendor account' },
        { status: 401 }
      );
    }

    if (!account.vendorId) {
      console.log('🍰 Cake Upload - Account has no vendorId, onboarding not completed');
      return NextResponse.json(
        { error: 'Vendor onboarding not completed' },
        { status: 401 }
      );
    }

    console.log('🍰 Cake Upload - Account verified, vendorId:', account.vendorId);

    // Check vendor onboarding status
    const vendor = await prisma.vendor.findUnique({
      where: { id: account.vendorId },
      include: { profile: true, cakes: true },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    if (vendor.approvalStatus !== 'approved') {
      return NextResponse.json(
        { error: 'Vendor must be approved before adding cakes' },
        { status: 403 }
      );
    }

    // No limit on number of cakes per vendor
    // Only restriction is on images per cake (max 4)

    const formData = await request.formData();

    // Get text fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const cakeType = formData.get('cakeType') as string | null;
    const basePrice = parseFloat(formData.get('basePrice') as string);
    const flavorsStr = formData.get('flavors') as string;
    const toppingsStr = formData.get('toppings') as string;
    const tagsStr = formData.get('tags') as string;
    const availableSizesStr = formData.get('availableSizes') as string;
    const isCustomizable = formData.get('isCustomizable') === 'true';

    // Validate required fields
    if (!name || !category || !basePrice || !flavorsStr || !toppingsStr) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, basePrice, flavors, toppings' },
        { status: 400 }
      );
    }

    // Get image files
    const imageFiles = formData.getAll('images') as File[];

    // Validate minimum 1 image
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least 1 image is required' },
        { status: 400 }
      );
    }

    // Validate maximum 4 images
    if (imageFiles.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 images allowed per cake' },
        { status: 400 }
      );
    }

    // Validate image file sizes (max 5MB per image)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      if (imageFile.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { 
            error: `Image ${i + 1} exceeds maximum size of 5MB. Current size: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB` 
          },
          { status: 400 }
        );
      }
    }

    // Upload images to Cloudinary
    const uploadedImages: string[] = [];

    for (const imageFile of imageFiles) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `cake-shop/vendors/${vendor.id}/cakes`,
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

      const cloudinaryResult = result as any;
      uploadedImages.push(cloudinaryResult.secure_url);
    }

    // Parse arrays
    const flavors = JSON.parse(flavorsStr || '[]');
    const toppings = JSON.parse(toppingsStr || '[]');
    const tags = JSON.parse(tagsStr || '[]');
    const availableSizes = JSON.parse(availableSizesStr || '[]');

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Create cake in database
    const cake = await prisma.cake.create({
      data: {
        vendorId: vendor.id,
        name,
        slug,
        description,
        category,
        cakeType: cakeType || null,
        basePrice,
        images: uploadedImages,
        flavors,
        tags,
        customOptions: {
          toppings,
          frostings: [], // Can be added later if needed
          messages: true,
        },
        availableSizes: availableSizes.length > 0 ? availableSizes : [
          { size: '0.5kg', price: basePrice },
          { size: '1kg', price: basePrice * 1.5 },
          { size: '2kg', price: basePrice * 2.5 },
        ],
        isCustomizable,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cake added successfully',
      cake: {
        id: cake.id,
        name: cake.name,
        category: cake.category,
        basePrice: parseFloat(cake.basePrice.toString()),
        images: cake.images,
      },
    });
  } catch (error) {
    console.error('Cake upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload cake', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
