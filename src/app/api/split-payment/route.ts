import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';

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

function getEmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

async function sendPaymentEmail(email: string, paymentLink: string, amount: number, cakeName: string) {
  try {
    console.log(`Attempting to send email to ${email}`);
    const transporter = getEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}:`, result.messageId);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const razorpay = getRazorpayInstance();
    const body = await request.json();
    const { totalAmount, coPayers, orderId, cakeName } = body;

    if (!totalAmount || !coPayers || coPayers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request parameters. Required: totalAmount, coPayers' },
        { status: 400 }
      );
    }

    // Create Razorpay order
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

    // Generate payment links for each co-payer
    const links = await Promise.all(
      coPayers.map(async (payer) => {
        console.log(`Creating payment link for ${payer.email} with amount ${payer.amount}`);
        
        const link = await razorpay.paymentLink.create({
          amount: Math.round(payer.amount * 100),
          currency: 'INR',
          description: `Split payment for ${cakeName} - ${payer.email}`,
        });
        
        console.log(`Payment link created: ${link.short_url || link.url}`);
        
        // Send email with payment link
        if (payer.email) {
          console.log(`Sending email to ${payer.email}...`);
          const emailSent = await sendPaymentEmail(
            payer.email,
            link.short_url || link.url,
            payer.amount,
            cakeName
          );
          console.log(`Email sent result: ${emailSent}`);
        }
        
        // Return link with co-payer details
        return {
          id: link.id,
          shortUrl: link.short_url || link.url,
          url: link.url,
          email: payer.email,
          amount: payer.amount,
          status: 'pending',
        };
      })
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      links: links,
      message: 'Payment links generated and emails sent to co-payers',
    });
  } catch (error) {
    console.error('Error creating split payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
