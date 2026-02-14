import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');
    const coPaymentId = request.nextUrl.searchParams.get('coPaymentId');

    if (!orderId && !coPaymentId) {
      return NextResponse.json(
        { error: 'orderId or coPaymentId required' },
        { status: 400 }
      );
    }

    let coPayment;

    if (coPaymentId) {
      coPayment = await prisma.coPayment.findUnique({
        where: { id: coPaymentId },
        include: {
          contributors: true,
          order: true,
        },
      });
    } else if (orderId) {
      coPayment = await prisma.coPayment.findUnique({
        where: { orderId },
        include: {
          contributors: true,
          order: true,
        },
      });
    }

    if (!coPayment) {
      return NextResponse.json(
        { error: 'Split payment not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalPaid = coPayment.contributors
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);

    const pendingCount = coPayment.contributors.filter(c => c.status === 'pending').length;
    const paidCount = coPayment.contributors.filter(c => c.status === 'paid').length;
    const allPaid = pendingCount === 0 && paidCount > 0;

    // Extract customer email from orderData if available
    const orderData = coPayment.orderData as any;
    const customerEmail = orderData?.customer?.email || null;

    console.log('[SPLIT-PAYMENT-STATUS] Response data:', {
      coPaymentId: coPayment.id,
      orderData: orderData ? 'Present' : 'Missing',
      customerEmail: customerEmail,
      allPaid: allPaid,
    });

    return NextResponse.json({
      coPaymentId: coPayment.id,
      orderId: coPayment.orderId,
      totalAmount: coPayment.totalAmount,
      collectedAmount: totalPaid,
      status: coPayment.status,
      customerEmail: customerEmail, // Include customer email for redirect
      
      // Contributor details
      contributors: coPayment.contributors.map(c => ({
        id: c.id,
        email: c.email,
        name: c.name,
        amount: c.amount,
        status: c.status,
        paidAt: c.paidAt,
      })),

      // Summary stats
      stats: {
        totalContributors: coPayment.contributors.length,
        paidCount,
        pendingCount,
        failedCount: coPayment.contributors.filter(c => c.status === 'failed').length,
        allPaid,
        completionPercentage: Math.round(
          (paidCount / coPayment.contributors.length) * 100
        ),
      },

      // Timeline
      createdAt: coPayment.createdAt,
      completedAt: coPayment.completedAt,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch split payment status';
    console.error('[SPLIT-PAYMENT-STATUS] Error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
