import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

/**
 * DEBUG ENDPOINT: View all active split payments and their payment links
 * GET /api/debug/split-payments
 */
export async function GET(request: NextRequest) {
  try {
    // Get all active coPayments
    const coPayments = await prisma.coPayment.findMany({
      include: {
        contributors: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Last 20
    });

    const formattedPayments = coPayments.map(cp => {
      const paidCount = cp.contributors.filter(c => c.status === 'paid').length;
      const allPaid = cp.contributors.every(c => c.status === 'paid');

      return {
        coPaymentId: cp.id,
        status: cp.status,
        totalAmount: cp.totalAmount,
        completedAt: cp.completedAt,
        createdAt: cp.createdAt,
        orderId: cp.orderId,
        orderNumber: cp.order?.orderNumber,
        contributors: cp.contributors.map(c => ({
          email: c.email,
          amount: c.amount,
          status: c.status,
          paymentLinkId: c.paymentLinkId,
          paidAt: c.paidAt,
        })),
        summary: {
          totalContributors: cp.contributors.length,
          paidContributors: paidCount,
          allPaid: allPaid,
          paymentProgress: `${paidCount}/${cp.contributors.length}`,
        }
      };
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalSplitPayments: formattedPayments.length,
      pendingPayments: formattedPayments.filter(cp => !cp.completedAt).length,
      completedPayments: formattedPayments.filter(cp => cp.completedAt).length,
      payments: formattedPayments,
    });
  } catch (error: any) {
    console.error('Debug split payments error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
