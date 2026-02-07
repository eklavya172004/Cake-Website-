import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all orders for a guest using email
 * Returns list of ongoing and pending orders
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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { orders: [] },
        { status: 200 }
      );
    }

    // Get orders for this user
    const orders = await prisma.order.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        finalAmount: order.finalAmount,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        vendor: order.vendor,
        user: order.user,
        items: order.items,
      }))
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
