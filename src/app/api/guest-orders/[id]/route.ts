import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Guest order tracking endpoint
 * Allows guests to view their order using email + order ID
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { email } = await request.json();
    const { id: orderId } = await params;

    if (!email || !orderId) {
      return NextResponse.json(
        { error: 'Email and order ID are required' },
        { status: 400 }
      );
    }

    // Verify the order belongs to the provided email
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            rating: true,
            description: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        deliveryPartner: {
          select: {
            id: true,
            name: true,
          }
        },
        coPayment: {
          include: {
            contributors: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify email matches
    if (order.user?.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match this order' },
        { status: 403 }
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Guest order fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
