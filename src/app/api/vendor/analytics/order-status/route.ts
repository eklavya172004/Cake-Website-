import { getServerSession } from 'next-auth';
import { db as prisma } from '@/lib/db/client';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ statusData: [] }), { status: 200 });
    }

    try {
      const account = await prisma.account.findFirst({
        where: { email: session.user.email },
      });

      if (!account?.vendorId) {
        return new Response(JSON.stringify({ statusData: [] }), { status: 200 });
      }

      const orders = await prisma.order.findMany({
        where: {
          vendorId: account.vendorId,
        },
        select: {
          status: true,
        },
      });

      const statusCounts = {
        delivered: 0,
        pending: 0,
        cancelled: 0,
      };

      orders.forEach((order: any) => {
        const status = order.status || 'pending';
        if (status === 'delivered' || status === 'out_for_delivery' || status === 'picked_up') {
          statusCounts.delivered += 1;
        } else if (status === 'cancelled') {
          statusCounts.cancelled += 1;
        } else {
          statusCounts.pending += 1;
        }
      });

      const statusData = [
        { name: 'Delivered', value: statusCounts.delivered, fill: '#10b981' },
        { name: 'Pending', value: statusCounts.pending, fill: '#f59e0b' },
        { name: 'Cancelled', value: statusCounts.cancelled, fill: '#ef4444' },
      ];

      return new Response(JSON.stringify({ statusData }), { status: 200 });
    } catch (dbError) {
      // Silently handle database errors during startup
      return new Response(JSON.stringify({ statusData: [] }), { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching order status:', error);
    return new Response(JSON.stringify({ statusData: [] }), { status: 200 });
  }
}
