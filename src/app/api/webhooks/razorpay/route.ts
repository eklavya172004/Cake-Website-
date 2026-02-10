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

    // Handle payment link paid event
    if (eventType === 'payment_link.paid') {
      const paymentLinkEntity = event.payload.payment_link.entity;
      const paymentEntity = event.payload.payment.entity;
      
      const paymentLinkId = paymentLinkEntity.id;
      const amount = paymentLinkEntity.amount / 100; // Convert from paise
      const orderId = paymentLinkEntity.notes?.order_id;
      const paymentType = paymentLinkEntity.notes?.payment_type || 'single';

      console.log(
        `Payment link ${paymentLinkId} paid for order ${orderId}. Amount: ₹${amount}, Type: ${paymentType}`
      );

      if (!orderId) {
        return NextResponse.json({ status: 'ok' });
      }

      // Get the order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { 
          vendor: {
            include: { profile: true }
          }
        },
      });

      if (!order) {
        console.warn(`Order ${orderId} not found`);
        return NextResponse.json({ status: 'ok' });
      }

      // Handle SINGLE payment mode
      if (paymentType === 'single') {
        // Update order payment status
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'completed',
            paymentMethod: 'razorpay',
            razorpayPaymentId: paymentEntity.id,
            status: 'confirmed',
            splitStatus: 'split_complete', // For single payments, mark as complete
          },
        });

        // Trigger payment split (20% admin, 80% vendor)
        try {
          const response = await fetch(
            `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/process-split`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                totalAmount: order.finalAmount,
                vendorId: order.vendorId,
                vendorBankAccount: order.vendor.profile ? {
                  account_number: order.vendor.profile.bankAccountNumber,
                  ifsc: order.vendor.profile.bankIfscCode,
                  beneficiary_name: order.vendor.profile.bankAccountHolderName,
                } : undefined,
              }),
            }
          );

          const splitResult = await response.json();
          console.log(
            `Split payment processed for order ${orderId}:`,
            splitResult
          );
        } catch (splitError) {
          console.error('Error processing payment split:', splitError);
        }
      }
      // Handle SPLIT payment mode
      else if (paymentType === 'split') {
        console.log(`Processing split payment for order ${orderId}`);

        try {
          // Get co-payment details from CoPayment model
          const coPayment = await prisma.coPayment.findUnique({
            where: { orderId },
            include: { contributors: true },
          });

          if (!coPayment) {
            console.warn(`CoPayment not found for order ${orderId}`);
            return NextResponse.json({ status: 'ok' });
          }

          // Mark this contributor as paid
          const updatedContributors = coPayment.contributors.map((c) => {
            if (c.paymentLinkId === paymentLinkId) {
              return { ...c, status: 'paid', paidAt: new Date() };
            }
            return c;
          });

          // Update co-payment status
          const allPaid = updatedContributors.every((c) => c.status === 'paid');
          const collectedAmount = updatedContributors.reduce(
            (sum, c) => sum + (c.status === 'paid' ? c.amount : 0),
            0
          );

          await prisma.coPayment.update({
            where: { id: coPayment.id },
            data: {
              status: allPaid ? 'completed' : 'partial',
              collectedAmount,
              completedAt: allPaid ? new Date() : null,
            },
          });

          // If all split payments are received, process the split
          if (allPaid) {
            console.log(`All split payments received for order ${orderId}`);

            // Update order status
            await prisma.order.update({
              where: { id: orderId },
              data: {
                paymentStatus: 'completed',
                paymentMethod: 'razorpay_split',
                status: 'confirmed',
                splitStatus: 'all_paid',
              },
            });

            // Trigger batch payment split (20% admin, 80% vendor)
            try {
              const response = await fetch(
                `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/process-split`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId,
                    totalAmount: order.finalAmount,
                    vendorId: order.vendorId,
                    vendorBankAccount: order.vendor.profile ? {
                      account_number: order.vendor.profile.bankAccountNumber,
                      ifsc: order.vendor.profile.bankIfscCode,
                      beneficiary_name: order.vendor.profile.bankAccountHolderName,
                    } : undefined,
                  }),
                }
              );

              const splitResult = await response.json();
              console.log(
                `Split payment processed for order ${orderId}:`,
                splitResult
              );
            } catch (splitError) {
              console.error(
                'Error processing batch payment split:',
                splitError
              );
            }
          }
        } catch (coPaymentError) {
          console.error('Error handling co-payment:', coPaymentError);
        }
      }

      // Handle COD mode
      else if (paymentType === 'cod') {
        // COD doesn't need immediate payment, just mark as pending
        console.log(`COD payment for order ${orderId} - awaiting delivery`);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
