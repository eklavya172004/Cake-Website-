import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
    });

    if (!account || account.role !== 'vendor' || !account.vendorId) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 401 }
      );
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: account.vendorId },
      include: {
        orders: true,
        cakes: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Calculate 30-day trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue: { [key: string]: number } = {};
    vendor.orders.forEach((order) => {
      if (new Date(order.createdAt) >= thirtyDaysAgo) {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + order.finalAmount;
      }
    });

    const trendData = Object.entries(dailyRevenue)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, revenue]) => ({ date, revenue }));

    const totalRevenue = vendor.orders.reduce((sum, o) => sum + o.finalAmount, 0);
    const totalOrders = vendor.orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate average rating from reviews
    let avgRating = 0;
    if (vendor.cakes.length > 0) {
      let totalRating = 0;
      for (const cake of vendor.cakes) {
        const reviews = await prisma.cakeReview.findMany({
          where: { cakeId: cake.id },
        });
        if (reviews.length > 0) {
          const cakeAvg =
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          totalRating += cakeAvg;
        }
      }
      avgRating = totalRating / vendor.cakes.length;
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      avgRating: avgRating.toFixed(1),
      totalProducts: vendor.cakes.length,
      trendData,
    });
  } catch (error) {
    console.error('Vendor analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
