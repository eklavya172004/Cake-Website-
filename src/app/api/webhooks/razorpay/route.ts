import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify the signature
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`Received webhook event: ${eventType}`);

    // Handle payment link completion
    if (eventType === 'payment_link.completed') {
      const paymentLinkId = event.payload.payment_link.entity.id;
      const amount = event.payload.payment_link.entity.amount / 100; // Convert from paise
      const customerEmail = event.payload.payment_link.entity.description;

      console.log(
        `Payment link ${paymentLinkId} completed for amount: ₹${amount}`
      );

      // Find orders with this payment link ID in the notes
      const orders = await prisma.order.findMany({
        where: {
          notes: {
            contains: paymentLinkId,
          },
        },
      });

      for (const order of orders) {
        if (!order.notes) continue;

        try {
          const notes = JSON.parse(order.notes);
          if (!notes.splitPaymentLinks) continue;

          // Update the payment link status
          const updatedLinks = notes.splitPaymentLinks.map((link: any) => {
            if (link.id === paymentLinkId) {
              return { ...link, status: 'paid' };
            }
            return link;
          });

          // Check if all payments are completed
          const allPaid = updatedLinks.every((link: any) => link.status === 'paid');

          // Update the order with new links data
          const updatedNotes = {
            ...notes,
            splitPaymentLinks: updatedLinks,
          };

          await prisma.order.update({
            where: { id: order.id },
            data: {
              notes: JSON.stringify(updatedNotes),
              paymentStatus: allPaid ? 'completed' : 'pending',
              status: allPaid ? 'confirmed' : order.status,
            },
          });

          console.log(
            `Updated order ${order.id}. All paid: ${allPaid}`
          );

          // If all payments are received, you can trigger order confirmation here
          if (allPaid) {
            console.log(`All payments received for order ${order.id}`);
            // You can add additional logic here - send confirmation email, update vendor status, etc.
          }
        } catch (parseError) {
          console.error('Error parsing order notes:', parseError);
        }
      }
    }

    // Handle payment link cancelled
    if (eventType === 'payment_link.cancelled') {
      const paymentLinkId = event.payload.payment_link.entity.id;
      console.log(`Payment link ${paymentLinkId} was cancelled`);

      // Update the link status to cancelled
      const orders = await prisma.order.findMany({
        where: {
          notes: {
            contains: paymentLinkId,
          },
        },
      });

      for (const order of orders) {
        if (!order.notes) continue;

        try {
          const notes = JSON.parse(order.notes);
          if (!notes.splitPaymentLinks) continue;

          const updatedLinks = notes.splitPaymentLinks.map((link: any) => {
            if (link.id === paymentLinkId) {
              return { ...link, status: 'cancelled' };
            }
            return link;
          });

          await prisma.order.update({
            where: { id: order.id },
            data: {
              notes: JSON.stringify({
                ...notes,
                splitPaymentLinks: updatedLinks,
              }),
            },
          });
        } catch (parseError) {
          console.error('Error parsing order notes:', parseError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
