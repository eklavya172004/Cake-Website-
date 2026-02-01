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

    // Calculate top vendors by revenue
    const vendorStats = new Map<string, { name: string; orders: number; revenue: number }>();
    
    orders.forEach((order) => {
      if (order.vendor) {
        const existing = vendorStats.get(order.vendorId) || {
          name: order.vendor.name,
          orders: 0,
          revenue: 0,
        };
        existing.orders += 1;
        existing.revenue += order.finalAmount;
        vendorStats.set(order.vendorId, existing);
      }
    });

    const topVendors = Array.from(vendorStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    // Calculate revenue data for last 6 days
    const revenueData = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt || new Date());
        return orderDate >= date && orderDate < nextDate;
      });

      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.finalAmount, 0);

      revenueData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      activeVendors,
      disputes,
      ordersByStatus,
      topVendors,
      revenueData,
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
