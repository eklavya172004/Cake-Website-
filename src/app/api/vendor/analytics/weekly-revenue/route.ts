import { getServerSession } from 'next-auth';
import { db as prisma } from '@/lib/db/client';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ weeklyData: [] }), { status: 200 });
    }

    try {
      const account = await prisma.account.findFirst({
        where: { email: session.user.email },
      });

      if (!account?.vendorId) {
        return new Response(JSON.stringify({ weeklyData: [] }), { status: 200 });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const orders = await prisma.order.findMany({
        where: {
          vendorId: account.vendorId,
          createdAt: {
            gte: sevenDaysAgo,
            lte: new Date(),
          },
        },
        select: {
          createdAt: true,
          finalAmount: true,
        },
      });

      const dataByDate: { [key: string]: { revenue: number; orders: number } } = {};

      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        dataByDate[dayName] = { revenue: 0, orders: 0 };
      }

      orders.forEach((order) => {
        const dateObj = new Date(order.createdAt);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        if (!dataByDate[dayName]) {
          dataByDate[dayName] = { revenue: 0, orders: 0 };
        }
        dataByDate[dayName].orders += 1;
        dataByDate[dayName].revenue += order.finalAmount || 0;
      });

      const weeklyData = Object.entries(dataByDate).map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue),
        orders: data.orders,
      }));

      return new Response(JSON.stringify({ weeklyData }), { status: 200 });
    } catch (dbError) {
      // Silently handle database errors during startup
      return new Response(JSON.stringify({ weeklyData: [] }), { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching weekly revenue:', error);
    return new Response(JSON.stringify({ weeklyData: [] }), { status: 200 });
  }
}
