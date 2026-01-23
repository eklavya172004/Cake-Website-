import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { vendor: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
    const totalOrders = orders.length;
    const activeVendors = new Set(orders.map((o) => o.vendorId)).size;
    const disputes = 0;

    const ordersByStatus = orders.reduce(
      (acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      activeVendors,
      disputes,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
