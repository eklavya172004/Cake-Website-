import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        rating: true,
        totalReviews: true,
        minOrderAmount: true,
        preparationTime: true,
        deliveryFee: true,
        isActive: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Convert Decimal to number if needed
    return NextResponse.json({
      ...vendor,
      deliveryFee: parseFloat(vendor.deliveryFee.toString()),
    });
  } catch (error) {
    console.error('Vendor fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}
