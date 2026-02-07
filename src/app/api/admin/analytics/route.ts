import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';

export async function GET() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'cancelled' } },
      include: { vendor: true },
    });

    // Calculate revenue trend
    const revenueTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayOrders = orders.filter(
        (o: any) =>
          new Date(o.createdAt).toDateString() === date.toDateString()
      );
      const revenue = dayOrders.reduce((sum: number, o: any) => sum + o.finalAmount, 0);
      const orderCount = dayOrders.length;
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        revenue: Math.round(revenue),
        orders: orderCount,
      };
    });

    // Get all cakes for category mapping (more efficient than fetching per order)
    const cakes = await prisma.cake.findMany({
      select: { id: true, category: true },
    });
    const cakeMap = new Map<string, string>(cakes.map((c: any) => [String(c.id), String(c.category)]));

    // Calculate category distribution
    const categoryCount = new Map<string, number>();
    
    orders.forEach((order: any) => {
      try {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item: any) => {
          const cakeId = String(item.cakeId || '');
          const category = String(cakeMap.get(cakeId) || 'Other');
          categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
        });
      } catch (error: any) {
        console.error('Error parsing order items:', error);
      }
    });

    const categoryData = Array.from(categoryCount.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    // Calculate top vendors
    const topVendors = Array.from(
      orders.reduce((acc: any, order: any) => {
        const vendorId = order.vendorId;
        if (!acc.has(vendorId)) {
          acc.set(vendorId, {
            name: order.vendor?.name || 'Unknown',
            revenue: 0,
            orders: 0,
            rating: order.vendor?.rating || 0,
          });
        }
        acc.get(vendorId).revenue += order.finalAmount;
        acc.get(vendorId).orders += 1;
        return acc;
      }, new Map())
        .values()
    )
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((v: any) => ({
        name: v.name,
        revenue: Math.round(v.revenue),
        orders: v.orders,
        rating: v.rating,
      }));

    return NextResponse.json({
      revenueTrend,
      categoryData,
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
