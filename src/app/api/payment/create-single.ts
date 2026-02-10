import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, customerEmail, customerName } = await req.json();

    if (!orderId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      accept_partial: false,
      description: `Cake Order #${orderId}`,
      customer: {
        email: customerEmail,
        name: customerName,
      },
      notify: {
        email: true,
        sms: false,
      },
      notes: {
        order_id: orderId,
        payment_type: 'single',
      },
    });

    // Store payment link in database
    // We'll track this with PaymentLink model once DB is migrated
    // For now, just log the link creation

    return NextResponse.json({
      success: true,
      paymentLink: {
        id: paymentLink.id,
        url: paymentLink.short_url,
        amount: amount,
      },
    });
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
