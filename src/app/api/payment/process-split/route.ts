import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/db/client';
import crypto from 'crypto';

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

// Razorpay API Base URL
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

// Create basic auth header for Razorpay API
function getRazorpayAuthHeader() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Create a payout via Razorpay Payouts API
 */
async function createPayout(payoutData: {
  account_number: string;
  ifsc_code: string;
  beneficiary_name: string;
  amount: number;
  mode: string;
  reference_id: string;
}) {
  try {
    const response = await axios.post(`${RAZORPAY_API_URL}/payouts`, payoutData, {
      headers: {
        'Authorization': getRazorpayAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Payout API error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Process payment split - calculates and executes automated payouts
 * Transfers 20% to admin account and 80% to vendor account via Razorpay Payouts API
 */
export async function POST(req: NextRequest) {
  try {
    console.log('📥 [PROCESS-SPLIT] API called');
    
    const {
      orderId,
      totalAmount,
      vendorId,
      vendorBankAccount,
    }: SplitPaymentRequest = await req.json();

    console.log('📦 [PROCESS-SPLIT] Request data:', {
      orderId,
      totalAmount,
      vendorId,
      vendorBankAccountAvailable: !!vendorBankAccount,
      vendorAccountNumber: vendorBankAccount?.account_number?.slice(-4) || 'MISSING',
      vendorIfsc: vendorBankAccount?.ifsc || 'MISSING',
    });

    if (!orderId || !totalAmount || !vendorId) {
      console.error('❌ [PROCESS-SPLIT] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('✅ [PROCESS-SPLIT] Validation passed');

    // Calculate split amounts (in rupees)
    const adminAmount = Math.round(totalAmount * (ADMIN_PERCENT / 100) * 100) / 100;
    const vendorAmount = Math.round(totalAmount * (VENDOR_PERCENT / 100) * 100) / 100;
    
    console.log('💰 [PROCESS-SPLIT] Calculated amounts:', {
      totalAmount,
      adminAmount,
      vendorAmount,
      adminPercent: ADMIN_PERCENT,
      vendorPercent: VENDOR_PERCENT,
    });

    const adminPayoutId = `admin-${orderId}`;
    const vendorPayoutId = `vendor-${orderId}`;
    
    let adminPayout: any = null;
    let vendorPayout: any = null;

    // Create admin payout (20%)
    try {
      console.log(`Creating admin payout: ₹${adminAmount}`);
      adminPayout = await createPayout({
        account_number: process.env.ADMIN_BANK_ACCOUNT_NUMBER!,
        ifsc_code: process.env.ADMIN_BANK_IFSC!,
        beneficiary_name: process.env.ADMIN_BANK_ACCOUNT_HOLDER || 'Admin',
        amount: Math.round(adminAmount * 100), // Convert to paise
        mode: 'NEFT', // National Electronic Funds Transfer
        reference_id: adminPayoutId,
      });
      console.log(`✅ Admin payout created: ${adminPayout.id}`);
    } catch (adminPayoutError) {
      console.error('Admin payout failed:', adminPayoutError);
      // Continue to vendor payout even if admin fails
    }

    // Create vendor payout (80%)
    try {
      if (!vendorBankAccount?.account_number || !vendorBankAccount?.ifsc) {
        throw new Error('Vendor bank details are incomplete');
      }

      console.log(`Creating vendor payout: ₹${vendorAmount}`);
      vendorPayout = await createPayout({
        account_number: vendorBankAccount.account_number,
        ifsc_code: vendorBankAccount.ifsc,
        beneficiary_name: vendorBankAccount.beneficiary_name,
        amount: Math.round(vendorAmount * 100), // Convert to paise
        mode: 'NEFT',
        reference_id: vendorPayoutId,
      });
      console.log(`✅ Vendor payout created: ${vendorPayout.id}`);
    } catch (vendorPayoutError) {
      console.error('Vendor payout failed:', vendorPayoutError);
    }

    // Store split record in database
    try {
      await prisma.paymentSplit.create({
        data: {
          orderId,
          totalAmount,
          adminAmount,
          vendorAmount,
          adminRazorpayTransferId: adminPayout?.id || null,
          vendorRazorpayTransferId: vendorPayout?.id || null,
          status: (adminPayout && vendorPayout) ? 'processing' : 'failed',
          adminTransferStatus: adminPayout?.status || 'failed',
          vendorTransferStatus: vendorPayout?.status || 'failed',
        },
      });
      console.log(`✅ Payment split record created for order ${orderId}`);
    } catch (dbError) {
      console.error('Error storing split record:', dbError);
    }

    console.log(`
      ===== PAYMENT SPLIT EXECUTED =====
      Order ID: ${orderId}
      Total Amount: ₹${totalAmount}
      
      Admin Commission (${ADMIN_PERCENT}%): ₹${adminAmount}
      Status: ${adminPayout?.status || 'failed'}
      Payout ID: ${adminPayout?.id || 'N/A'}
      
      Vendor Settlement (${VENDOR_PERCENT}%): ₹${vendorAmount}
      Status: ${vendorPayout?.status || 'failed'}
      Payout ID: ${vendorPayout?.id || 'N/A'}
      
      Vendor Bank Account: ${vendorBankAccount?.beneficiary_name || 'N/A'}
      Account: ${vendorBankAccount?.account_number?.slice(-4) || 'N/A'} (****...)
      IFSC: ${vendorBankAccount?.ifsc || 'N/A'}
      ===================================
    `);

    return NextResponse.json({
      success: true,
      orderId,
      splits: {
        adminAmount,
        vendorAmount,
        adminPayout: {
          id: adminPayout?.id,
          status: adminPayout?.status || 'failed',
          amount: adminAmount,
          account: process.env.ADMIN_BANK_ACCOUNT_NUMBER?.slice(-4),
        },
        vendorPayout: {
          id: vendorPayout?.id,
          status: vendorPayout?.status || 'failed',
          amount: vendorAmount,
          account: vendorBankAccount?.account_number?.slice(-4),
        },
        message: 'Payouts initiated via Razorpay',
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
