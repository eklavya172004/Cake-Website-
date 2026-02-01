import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const account = await prisma.account.findFirst({
      where: { email: session.user.email },
    });

    if (!account?.vendorId) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const orders = await prisma.order.findMany({
      where: {
        vendorId: account.vendorId,
      },
      select: {
        items: true,
        finalAmount: true,
      },
    });

    const productStats: { [cakeId: string]: { name: string; price: number; orders: number; revenue: number } } = {};

    for (const order of orders) {
      const items = (order.items as any[]) || [];
      for (const item of items) {
        if (!productStats[item.cakeId]) {
          productStats[item.cakeId] = {
            name: item.name,
            price: item.price,
            orders: 0,
            revenue: 0,
          };
        }
        productStats[item.cakeId].orders += item.quantity || 1;
        productStats[item.cakeId].revenue += (item.price || 0) * (item.quantity || 1);
      }
    }

    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        basePrice: stats.price,
        totalOrders: stats.orders,
        totalRevenue: Math.round(stats.revenue),
      }))
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5);

    return new Response(JSON.stringify(topProducts), { status: 200 });
  } catch (error) {
    console.error('Error fetching top products:', error);
    return new Response(JSON.stringify([]), { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}
