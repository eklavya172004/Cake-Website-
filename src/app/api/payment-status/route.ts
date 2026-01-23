import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import Razorpay from 'razorpay';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const checkRazorpay = searchParams.get('checkRazorpay') === 'true'; // Flag to check Razorpay for latest status

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the order with split payment details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Parse split payment data from order notes
    let splitPaymentData: { coPayers: any[]; status: string } = { coPayers: [], status: 'pending' };
    if (order.notes) {
      try {
        console.log('Raw order.notes:', order.notes); // Debug - check if it's already stringified
        const notes = JSON.parse(order.notes);
        console.log('Parsed notes:', notes); // Debug
        console.log('Type of notes:', typeof notes); // Debug
        console.log('notes keys:', Object.keys(notes)); // Debug
        console.log('Split payment links:', notes.splitPaymentLinks); // Debug
        console.log('Type of splitPaymentLinks:', typeof notes.splitPaymentLinks); // Debug
        
        if (notes.splitPaymentLinks) {
          // If checkRazorpay is true, fetch latest status from Razorpay
          if (checkRazorpay) {
            try {
              const razorpay = getRazorpayInstance();
              const updatedLinks = [];

              for (const link of notes.splitPaymentLinks) {
                try {
                  const paymentLink = await razorpay.paymentLink.fetch(link.id);
                  // Only update to 'paid' if Razorpay says it's completed
                  // Otherwise keep the current status from database (to preserve manual test updates)
                  const newStatus = paymentLink.status === 'paid' ? 'paid' : link.status;
                  updatedLinks.push({
                    ...link,
                    status: newStatus,
                    shortUrl: paymentLink.short_url || link.shortUrl,
                  });
                } catch (err) {
                  console.error(`Error fetching payment link ${link.id}:`, err);
                  updatedLinks.push(link); // Keep original data if fetch fails
                }
              }

              splitPaymentData.coPayers = updatedLinks.map((link: any) => ({
                email: link.email || 'Unknown',
                amount: link.amount || 0,
                status: link.status || 'pending',
                paymentLinkId: link.id,
              }));

              // Save the updated status back to the database
              const allPaid = updatedLinks.every((link: any) => link.status === 'paid');
              await prisma.order.update({
                where: { id: orderId },
                data: {
                  notes: JSON.stringify({
                    splitPaymentLinks: updatedLinks,
                  }),
                  paymentStatus: allPaid ? 'completed' : 'pending',
                  status: allPaid ? 'confirmed' : order.status,
                },
              });
              console.log('Order updated with latest Razorpay status');
            } catch (err) {
              console.error('Error checking Razorpay status:', err);
              // Fall back to stored data
              splitPaymentData.coPayers = notes.splitPaymentLinks.map((link: any) => ({
                email: link.email || 'Unknown',
                amount: link.amount || 0,
                status: link.status || 'pending',
                paymentLinkId: link.id,
              }));
            }
          } else {
            // Use stored data from order notes
            splitPaymentData.coPayers = notes.splitPaymentLinks.map((link: any) => ({
              email: link.email || 'Unknown',
              amount: link.amount || 0,
              status: link.status || 'pending',
              paymentLinkId: link.id,
            }));
          }
        } else {
          // No splitPaymentLinks found, but check if it's an old format or missing
          console.log('No splitPaymentLinks in notes'); // Debug
        }
      } catch (e) {
        console.error('Error parsing split payment data:', e);
      }
    }

    // Check if all payments are completed
    const allPaid = splitPaymentData.coPayers.every((p: any) => p.status === 'paid');
    splitPaymentData.status = allPaid ? 'completed' : 'pending';

    return NextResponse.json({
      success: true,
      orderId,
      totalAmount: order.finalAmount,
      paymentMethod: order.paymentMethod,
      orderStatus: order.status,
      splitPayment: splitPaymentData,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
