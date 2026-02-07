import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    // If user not found in database, return empty orders (for demo/signup users)
    if (!user) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    // Get all orders for the user
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format the response
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      finalAmount: order.finalAmount,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      notes: order.notes,
      items: order.items,
      deliveryAddress: order.deliveryAddress,
      deliveryPincode: order.deliveryPincode,
      createdAt: order.createdAt,
      estimatedDelivery: order.estimatedDelivery,
      vendor: order.vendor,
    }));

    console.log("User orders API - User:", session.user.email);
    console.log("User orders API - Total orders:", formattedOrders.length);
    
    // Log all split payment orders
    const splitOrders = formattedOrders.filter((o: any) => o.paymentMethod === 'split');
    console.log("Split payment orders found:", splitOrders.length);
    splitOrders.forEach((order: any, idx: number) => {
      console.log(`  [${idx}] Order ${order.orderNumber} - Notes:`, order.notes ? JSON.parse(order.notes).splitPaymentLinks?.length + " links" : "no notes");
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
