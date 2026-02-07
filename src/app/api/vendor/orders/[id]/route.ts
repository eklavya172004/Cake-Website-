import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db/client';
import { sendOrderStatusNotification } from '@/lib/notifications/order-status-notifications';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify vendor owns this order
    const account = await prisma.account.findUnique({
      where: { email: session.user.email! },
    });

    if (!account || account.role !== 'vendor' || !account.vendorId) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 401 });
    }

    // Check if vendor owns the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.vendorId !== account.vendorId) {
      return NextResponse.json(
        { error: 'Unauthorized: This order does not belong to your shop' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, deliveryFee } = body;

    // Prepare update data
    const updateData: any = {};

    // Handle status update
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Handle delivery fee update
    if (deliveryFee !== undefined && deliveryFee !== null) {
      if (typeof deliveryFee !== 'number' || deliveryFee < 0) {
        return NextResponse.json(
          { error: 'Delivery fee must be a non-negative number' },
          { status: 400 }
        );
      }
      // Calculate new final amount
      const subtotal = order.totalAmount - order.deliveryFee;
      const newFinalAmount = subtotal + deliveryFee - order.discount;
      updateData.deliveryFee = deliveryFee;
      updateData.finalAmount = newFinalAmount;
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    // Create status history record if status was updated
    if (status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          message: `Order status updated to ${status} by vendor`,
          createdBy: 'vendor',
        },
      });

      // Send notification to customer only for confirmed and delivered statuses
      if (order.user?.email && (status === 'confirmed' || status === 'delivered')) {
        const vendor = await prisma.vendor.findUnique({
          where: { id: order.vendorId },
        });

        // Send notification asynchronously (don't wait for it)
        sendOrderStatusNotification({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.user.email,
          customerName: order.user.name || 'Valued Customer',
          vendorName: vendor?.name || 'Vendor',
          oldStatus: order.status,
          newStatus: status,
          estimatedDelivery: order.estimatedDelivery || new Date(),
          trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/orders/${order.id}`,
        }).catch((err) => {
          console.error('Failed to send status notification:', err);
        });
      }
    }

    // Format response
    const formattedOrder = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customer: updatedOrder.user?.name || 'Unknown',
      email: updatedOrder.user?.email,
      totalAmount: updatedOrder.finalAmount,
      deliveryFee: updatedOrder.deliveryFee,
      status: updatedOrder.status,
      itemsCount: Array.isArray(updatedOrder.items) ? updatedOrder.items.length : 0,
      items: Array.isArray(updatedOrder.items)
        ? updatedOrder.items.map((item: any) => ({
            cakeName: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        : [],
      deliveryAddress: updatedOrder.deliveryAddress,
      deliveryDate: updatedOrder.estimatedDelivery,
      createdAt: updatedOrder.createdAt,
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
