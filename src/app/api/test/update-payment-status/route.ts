import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentLinkId, status } = body;

    if (!orderId || !paymentLinkId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, paymentLinkId, status' },
        { status: 400 }
      );
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.notes) {
      return NextResponse.json(
        { error: 'Order not found or has no split payment data' },
        { status: 404 }
      );
    }

    try {
      const notes = JSON.parse(order.notes);
      if (!notes.splitPaymentLinks) {
        return NextResponse.json(
          { error: 'No split payment links found in order' },
          { status: 400 }
        );
      }

      // Update the specific payment link status
      const updatedLinks = notes.splitPaymentLinks.map((link: any) => {
        if (link.id === paymentLinkId) {
          return { ...link, status: status };
        }
        return link;
      });

      // Check if all payments are completed
      const allPaid = updatedLinks.every((link: any) => link.status === 'paid');

      // Update the order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          notes: JSON.stringify({
            ...notes,
            splitPaymentLinks: updatedLinks,
          }),
          paymentStatus: allPaid ? 'completed' : 'pending',
          status: allPaid ? 'confirmed' : order.status,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Payment link status updated to ${status}`,
        allPaid,
      });
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse order notes' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
