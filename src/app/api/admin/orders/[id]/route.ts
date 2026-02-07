import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db/client';
import { sendOrderStatusNotification } from '@/lib/notifications/order-status-notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        deliveryPartner: {
          select: {
            id: true,
            name: true,
          },
        },
        statusHistory: true,
        coPayment: true,
        disputes: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'picked_up',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vendor: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { orderNumber: id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vendor: { select: { id: true, name: true } },
      },
    });

    // Create status history record
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        message: `Order status updated to ${status} by admin`,
        createdBy: 'admin',
      },
    });

    // Send email notification to customer for confirmed and delivered statuses
    if (updatedOrder.user?.email && (status === 'confirmed' || status === 'delivered')) {
      sendOrderStatusNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: updatedOrder.user.email,
        customerName: updatedOrder.user.name || 'Valued Customer',
        vendorName: updatedOrder.vendor?.name || 'Vendor',
        oldStatus: order.status,
        newStatus: status,
        estimatedDelivery: order.estimatedDelivery || new Date(),
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders/${order.id}`,
      }).catch((err) => {
        console.error('Failed to send status notification:', err);
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber: id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete related records first
    await prisma.orderStatusHistory.deleteMany({
      where: { orderId: order.id },
    });

    await prisma.notification.deleteMany({
      where: { orderId: order.id },
    });

    // Delete the order
    await prisma.order.delete({
      where: { orderNumber: id },
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
