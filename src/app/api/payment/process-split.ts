import { NextRequest, NextResponse } from 'next/server';

// Split amounts: Admin 20%, Vendor 80%
const ADMIN_PERCENT = Number(process.env.ADMIN_COMMISSION_PERCENT) || 20;
const VENDOR_PERCENT = Number(process.env.VENDOR_COMMISSION_PERCENT) || 80;

interface SplitPaymentRequest {
  orderId: string;
  totalAmount: number;
  vendorId: string;
  vendorBankAccount?: {
    account_number: string;
    ifsc: string;
    beneficiary_name: string;
  };
}

/**
 * Process payment split - calculates and logs admin/vendor amounts
 * Actual bank transfers can be done via Razorpay dashboard or scheduled payout job
 */
export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      totalAmount,
      vendorId,
      vendorBankAccount,
    }: SplitPaymentRequest = await req.json();

    if (!orderId || !totalAmount || !vendorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate split amounts
    const adminAmount = Math.round(totalAmount * (ADMIN_PERCENT / 100) * 100) / 100;
    const vendorAmount = Math.round(totalAmount * (VENDOR_PERCENT / 100) * 100) / 100;

    console.log(`
      ===== PAYMENT SPLIT PROCESSED =====
      Order ID: ${orderId}
      Total Amount: ₹${totalAmount}
      
      Admin Commission (${ADMIN_PERCENT}%): ₹${adminAmount}
      Vendor Settlement (${VENDOR_PERCENT}%): ₹${vendorAmount}
      
      Vendor Bank Account: ${vendorBankAccount?.beneficiary_name || 'N/A'}
      Account: ${vendorBankAccount?.account_number?.slice(-4) || 'N/A'} (****...)
      IFSC: ${vendorBankAccount?.ifsc || 'N/A'}
      
      Status: Ready for settlement via Razorpay dashboard or payout API
      ===================================
    `);

    // TODO: In production, integrate with:
    // 1. Razorpay Payouts API for automatic bank transfers
    // 2. Scheduled job to settle payments periodically
    // 3. Payment split records in database for auditing

    return NextResponse.json({
      success: true,
      orderId,
      splits: {
        adminAmount,
        vendorAmount,
        adminAccount: {
          number: process.env.ADMIN_BANK_ACCOUNT_NUMBER,
          ifsc: process.env.ADMIN_BANK_IFSC,
          holder: process.env.ADMIN_BANK_ACCOUNT_HOLDER,
        },
        vendorAccount: vendorBankAccount,
        status: 'calculated',
        message: 'Amounts calculated. Manual settlement via Razorpay required.',
      },
    });
  } catch (error: any) {
    console.error('Error processing payment split:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment split' },
      { status: 500 }
    );
  }
}
