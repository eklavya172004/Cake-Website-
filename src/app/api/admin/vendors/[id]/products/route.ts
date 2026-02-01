import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const whereClause: any = { vendorId };
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    const [cakes, total] = await Promise.all([
      prisma.cake.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          basePrice: true,
          category: true,
          flavor: true,
          images: true,
          availableSizes: true,
          isActive: true,
          isCustomizable: true,
          rating: true,
          reviewCount: true,
          popularity: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cake.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      cakes: cakes.map((cake) => ({
        ...cake,
        createdAt: cake.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching vendor cakes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor products' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    const body = await request.json();

    const {
      name,
      description,
      basePrice,
      category,
      flavor,
      images,
      availableSizes,
      isCustomizable,
      customOptions,
    } = body;

    if (!name || !basePrice || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);

    const cake = await prisma.cake.create({
      data: {
        vendorId,
        name,
        slug,
        description,
        basePrice,
        category,
        flavor,
        images: images || [],
        availableSizes: availableSizes || [],
        isCustomizable,
        customOptions,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        cake,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating cake:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = params.id;
    const body = await request.json();

    const { cakeId, ...updateData } = body;

    if (!cakeId) {
      return NextResponse.json(
        { error: 'Missing cake ID' },
        { status: 400 }
      );
    }

    // Verify the cake belongs to this vendor
    const cake = await prisma.cake.findFirst({
      where: { id: cakeId, vendorId },
    });

    if (!cake) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedCake = await prisma.cake.update({
      where: { id: cakeId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      cake: updatedCake,
    });
  } catch (error) {
    console.error('Error updating cake:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = params.id;
    const { searchParams } = new URL(request.url);
    const cakeId = searchParams.get('cakeId');

    if (!cakeId) {
      return NextResponse.json(
        { error: 'Missing cake ID' },
        { status: 400 }
      );
    }

    // Verify the cake belongs to this vendor
    const cake = await prisma.cake.findFirst({
      where: { id: cakeId, vendorId },
    });

    if (!cake) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await prisma.cake.delete({
      where: { id: cakeId },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting cake:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
