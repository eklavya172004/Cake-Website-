import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: { select: { cakes: true, orders: true } },
      },
    });

    const vendorData = vendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      owner: vendor.name,
      orders: vendor._count.orders,
      products: vendor._count.cakes,
      rating: vendor.rating || 0,
      revenue: 0,
      status: vendor.isActive ? 'active' : 'inactive',
      verification: vendor.verificationStatus,
    }));

    return NextResponse.json(vendorData);
  } catch (error) {
    console.error('Vendors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
