import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/orders/[id]/status-notification
 * 
 * Fetches the latest status update for an order.
 * Used by real-time notification system.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { email: true }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (order.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const latestStatusChange = order.statusHistory[0];

    return NextResponse.json({
      orderId,
      currentStatus: order.status,
      latestStatusChange: latestStatusChange ? {
        status: latestStatusChange.status,
        message: latestStatusChange.message,
        createdBy: latestStatusChange.createdBy,
        createdAt: latestStatusChange.createdAt,
      } : null,
      lastUpdated: latestStatusChange?.createdAt || order.createdAt,
    });
  } catch (error) {
    console.error('Status notification error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status notification' },
      { status: 500 }
    );
  }
}
