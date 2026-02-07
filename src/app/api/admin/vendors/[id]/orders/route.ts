import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const whereClause: any = { vendorId };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          deliveryFee: true,
          discount: true,
          finalAmount: true,
          paymentStatus: true,
          paymentMethod: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: true,
          createdAt: true,
          deliveredAt: true,
          estimatedDelivery: true,
          notes: true,
          vendorNotes: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),
        estimatedDelivery: order.estimatedDelivery?.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor orders' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    const { orderId, status, notes } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the order belongs to this vendor
    const order = await prisma.order.findFirst({
      where: { id: orderId, vendorId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        vendorNotes: notes || undefined,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Create status history record
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        message: `Order status updated to ${status}`,
        createdBy: 'vendor',
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        createdAt: updatedOrder.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
