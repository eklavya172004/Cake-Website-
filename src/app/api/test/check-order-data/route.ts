import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Parse and return raw data
    const notes = order.notes ? JSON.parse(order.notes) : null;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentMethod: order.paymentMethod,
      notes: notes,
      rawNotes: order.notes,
      splitPaymentLinks: notes?.splitPaymentLinks || [],
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to check order data', details: String(error) },
      { status: 500 }
    );
  }
}
