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

    const userEmail = session.user.email!;

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // Initialize orders array
    let allOrders: any[] = [];

    // 1. Get authenticated user's regular orders (if user exists)
    if (user) {
      const userOrders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          coPayment: {
            include: {
              contributors: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      allOrders = userOrders;
    }

    // 2. Get split payment orders where customer email matches
    const splitPaymentOrders = await prisma.order.findMany({
      where: {
        coPayment: {
          isNot: null,
        },
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        coPayment: {
          include: {
            contributors: true,
          },
        },
      },
    });

    // Filter split payment orders by customer email from orderData
    const matchingSplitOrders = splitPaymentOrders.filter((order: any) => {
      if (!order.coPayment?.orderData) return false;
      const orderData = order.coPayment.orderData as any;
      return orderData.customer?.email === userEmail;
    });

    // Combine all orders (authenticated + split payment by email)
    const combinedOrders = [...allOrders, ...matchingSplitOrders];

    // Remove duplicates (in case user is both owner and in split payment)
    const uniqueOrders = Array.from(
      new Map(combinedOrders.map((order: any) => [order.id, order])).values()
    );

    // Format the response
    const formattedOrders = uniqueOrders.map((order: any) => ({
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
      splitStatus: order.splitStatus,
      coPayment: order.coPayment ? {
        id: order.coPayment.id,
        contributors: order.coPayment.contributors,
        status: order.coPayment.status,
        collectedAmount: order.coPayment.collectedAmount,
        totalAmount: order.coPayment.totalAmount,
      } : null,
    }));

    // Sort by latest first
    formattedOrders.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log("User orders API - User:", userEmail);
    console.log("User orders API - Authenticated orders:", allOrders.length);
    console.log("User orders API - Split payment orders (by email):", matchingSplitOrders.length);
    console.log("User orders API - Total unique orders:", formattedOrders.length);

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
