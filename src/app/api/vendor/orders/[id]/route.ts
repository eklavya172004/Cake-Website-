import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { user: true },
    });

    // Format response
    const formattedOrder = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customer: updatedOrder.user?.name || 'Unknown',
      email: updatedOrder.user?.email,
      totalAmount: updatedOrder.finalAmount,
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
