import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Account table
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

    const today = new Date().toDateString();
    const todayOrders = vendor.orders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    );

    const todayRevenue = todayOrders.reduce(
      (sum, o) => sum + o.finalAmount,
      0
    );
    const totalRevenue = vendor.orders.reduce(
      (sum, o) => sum + o.finalAmount,
      0
    );
    const completionRate = vendor.orders.length
      ? Math.round(
          ((vendor.orders.filter((o) => o.status === 'delivered').length /
            vendor.orders.length) *
            100)
        )
      : 0;
    const pendingOrders = vendor.orders.filter(
      (o) => o.status === 'pending' || o.status === 'processing'
    ).length;

    return NextResponse.json({
      todayOrders: todayOrders.length,
      todayRevenue: Math.round(todayRevenue),
      totalRevenue: Math.round(totalRevenue),
      rating: vendor.rating,
      completionRate,
      pendingOrders,
      totalProducts: vendor.cakes.length,
    });
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
