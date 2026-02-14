import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { prisma } from '@/lib/db/client';

function getRazorpayInstance() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

async function sendPaymentEmail(email: string, paymentLink: string, amount: number, cakeName: string) {
  try {
    console.log(`[SPLIT-PAYMENT] Sending email to ${email}`);
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: "noreply@purblepalace.in",
      to: email,
      subject: `Payment Link for ${cakeName} Order`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d946a6;">Payment Required</h2>
          <p>Hi,</p>
          <p>You have been sent a secure payment link to complete your share of the cake order.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Cake:</strong> ${cakeName}</p>
            <p style="margin: 10px 0;"><strong>Amount Due:</strong> ₹${amount.toFixed(2)}</p>
            <p style="margin: 10px 0;">
              <a href="${paymentLink}" style="display: inline-block; background-color: #d946a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Pay Now
              </a>
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Or copy this link: <br/>
            <code style="background-color: #f0f0f0; padding: 10px; display: block; word-break: break-all;">
              ${paymentLink}
            </code>
          </p>
          
          <p style="color: #999; font-size: 12px;">
            This is a secure payment link. Do not share it with others. Your order will be placed once all payments are received.
          </p>
        </div>
      `,
    });
    
    if (result.error) {
      console.error(`[SPLIT-PAYMENT] Email error for ${email}:`, result.error);
      return false;
    }
    
    console.log(`[SPLIT-PAYMENT] Email sent to ${email}: ${result.data?.id}`);
    return true;
  } catch (error) {
    console.error(`[SPLIT-PAYMENT] Error sending email to ${email}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[SPLIT-PAYMENT] API called');
    
    const razorpay = getRazorpayInstance();
    const body = await request.json();
    let { totalAmount, coPayers, orderId, cakeName, orderData } = body;

    // Remove emojis from cake name (Razorpay doesn't support them)
    cakeName = cakeName.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim() || 'Cake Order';

    console.log('[SPLIT-PAYMENT] Request data:', { totalAmount, coPayers: coPayers?.length, cakeName });

    if (!totalAmount || !coPayers || coPayers.length === 0) {
      console.error('[SPLIT-PAYMENT] Invalid parameters');
      return NextResponse.json(
        { error: 'Invalid request parameters. Required: totalAmount, coPayers' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    console.log('[SPLIT-PAYMENT] Creating Razorpay order...');
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: orderId || randomUUID(),
      notes: {
        coPayers: JSON.stringify(coPayers),
        description: 'Split Payment for Cake Order',
        cakeName: cakeName,
      },
    });

    console.log('[SPLIT-PAYMENT] Razorpay order created:', order.id);

    // Generate payment links for each co-payer
    console.log('[SPLIT-PAYMENT] Creating payment links for', coPayers.length, 'co-payers');
    
    const links = await Promise.all(
      coPayers.map(async (payer: any) => {
        try {
          console.log(`[SPLIT-PAYMENT] Creating link for ${payer.email}: ₹${payer.amount}`);

          const link = await razorpay.paymentLink.create({
            amount: Math.round(payer.amount * 100),
            currency: 'INR',
            description: `Split payment for ${cakeName}`,
            notes: {
              order_id: orderId || 'split-payment',
              type: 'split_payment',
            },
          } as any);

          console.log(`[SPLIT-PAYMENT] Link created for ${payer.email}:`, link.id);

          // Send email with payment link
          if (payer.email) {
            const emailUrl = link.short_url || `https://rzp.io/${link.id}`;
            console.log(`[SPLIT-PAYMENT] Will send link to ${payer.email}: ${emailUrl}`);
            
            const emailSent = await sendPaymentEmail(
              payer.email,
              emailUrl,
              payer.amount,
              cakeName
            );
            
            console.log(`[SPLIT-PAYMENT] Email result for ${payer.email}: ${emailSent}`);
          }

          // Return link with co-payer details
          return {
            id: link.id,
            shortUrl: link.short_url || `https://rzp.io/${link.id}`,
            url: link.short_url || `https://rzp.io/${link.id}`,
            email: payer.email,
            amount: payer.amount,
            status: link.status || 'pending',
          };
        } catch (payerError: any) {
          console.error(`[SPLIT-PAYMENT] Error creating link for ${payer.email}:`, payerError.message || payerError);
          throw payerError;
        }
      })
    );

    console.log('[SPLIT-PAYMENT] All links created successfully. Returning response...');

    // Save CoPayment record to database
    try {
      console.log('[SPLIT-PAYMENT] Saving CoPayment with orderData:');
      console.log('[SPLIT-PAYMENT] orderData customer email:', orderData?.customer?.email);
      console.log('[SPLIT-PAYMENT] orderData items:', JSON.stringify(orderData?.items, null, 2));
      console.log('[SPLIT-PAYMENT] orderData delivery address:', JSON.stringify(orderData?.deliveryAddress, null, 2));
      console.log('[SPLIT-PAYMENT] Full orderData size:', JSON.stringify(orderData).length, 'bytes');
      
      const coPayment = await prisma.coPayment.create({
        data: {
          // Don't set orderId yet - it will be linked after order is created
          totalAmount,
          status: 'pending', // Will update when payments are received
          orderData: orderData || null, // Store order details for creating order after payment
          contributors: {
            create: coPayers.map((payer: any, idx: number) => ({
              email: payer.email,
              name: payer.name || payer.email.split('@')[0],
              amount: payer.amount,
              status: 'pending',
              paymentLinkId: links[idx]?.id, // Store Razorpay payment link ID
            })),
          },
          paymentLinks: links.map(l => ({
            id: l.id,
            url: l.shortUrl || l.url,
            email: l.email,
            amount: l.amount,
          })),
        },
        include: {
          contributors: true,
        },
      });

      console.log('[SPLIT-PAYMENT] CoPayment record saved:', coPayment.id);

      return NextResponse.json({
        success: true,
        coPaymentId: coPayment.id,  // Use coPaymentId instead of orderId
        amount: totalAmount,
        currency: 'INR',
        links: links,
        contributors: coPayment.contributors.map(c => ({
          email: c.email,
          name: c.name,
          amount: c.amount,
          status: c.status,
        })),
        message: 'Payment links generated and emails sent to co-payers',
      });
    } catch (dbError: any) {
      console.error('[SPLIT-PAYMENT] Error saving to database:', dbError);
      // Still return success since payment links were created
      return NextResponse.json({
        success: true,
        amount: totalAmount,
        currency: 'INR',
        links: links,
        message: 'Payment links generated and emails sent to co-payers',
      });
    }
  } catch (error: any) {
    console.error('[SPLIT-PAYMENT] Error in split payment:', error);
    console.error('[SPLIT-PAYMENT] Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response?.data,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}
