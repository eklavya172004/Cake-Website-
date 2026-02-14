import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all orders for a guest using email
 * Returns list of ongoing and pending orders (including split payment orders)
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    let allOrders: any[] = [];

    // 1. Get orders for registered user (if exists)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (user) {
      const userOrders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              logo: true,
            }
          },
          user: {
            select: {
              email: true,
              name: true,
            }
          },
          coPayment: {
            include: {
              contributors: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      allOrders = userOrders;
    }

    // 2. Get split payment orders by email (guest orders)
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
            logo: true,
          }
        },
        user: {
          select: {
            email: true,
            name: true,
          }
        },
        coPayment: {
          include: {
            contributors: true,
          }
        }
      },
    });

    // Filter split payment orders by customer email
    const matchingSplitOrders = splitPaymentOrders.filter((order: any) => {
      if (!order.coPayment?.orderData) return false;
      const orderData = order.coPayment.orderData as any;
      return orderData.customer?.email?.toLowerCase() === normalizedEmail;
    });

    // Combine and deduplicate
    const combinedOrders = [...allOrders, ...matchingSplitOrders];
    const uniqueOrders = Array.from(
      new Map(combinedOrders.map((order: any) => [order.id, order])).values()
    );

    // Sort by latest first
    uniqueOrders.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const formattedOrders = uniqueOrders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      finalAmount: order.finalAmount,
      createdAt: order.createdAt,
      estimatedDelivery: order.estimatedDelivery,
      vendor: order.vendor,
      user: order.user,
      items: order.items,
      splitStatus: order.splitStatus,
      coPayment: order.coPayment ? {
        id: order.coPayment.id,
        contributors: order.coPayment.contributors,
        status: order.coPayment.status,
        collectedAmount: order.coPayment.collectedAmount,
        totalAmount: order.coPayment.totalAmount,
      } : null,
    }));

    console.log(`Guest orders - Email: ${normalizedEmail}, Authenticated user orders: ${allOrders.length}, Split payment orders: ${matchingSplitOrders.length}, Total: ${formattedOrders.length}`);

    return NextResponse.json({
      orders: formattedOrders
    });
  } catch (error: any) {
    console.error('Guest orders list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
