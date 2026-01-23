import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { vendor: true },
    });

    const revenueTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayOrders = orders.filter(
        (o) =>
          new Date(o.createdAt).toDateString() === date.toDateString()
      );
      const revenue = dayOrders.reduce((sum, o) => sum + o.finalAmount, 0);
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        revenue: Math.round(revenue),
      };
    });

    const topVendors = Array.from(
      orders.reduce((acc: any, order: any) => {
        const vendorId = order.vendorId;
        if (!acc.has(vendorId)) {
          acc.set(vendorId, {
            name: order.vendor?.name || 'Unknown',
            revenue: 0,
          });
        }
        acc.get(vendorId).revenue += order.finalAmount;
        return acc;
      }, new Map())
        .values()
    )
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((v: any) => ({
        name: v.name,
        revenue: Math.round(v.revenue),
      }));

    return NextResponse.json({
      revenueTrend,
      topVendors,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
