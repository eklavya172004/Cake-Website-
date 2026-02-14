import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import crypto from 'crypto';
import axios from 'axios';
import { sendVendorOrderNotification, sendCustomerOrderConfirmation } from '@/lib/email';

interface OrderItemForEmail {
  name: string;
  quantity: number;
  price: number;
  customization?: string | null;
}

interface DeliveryAddressForEmail {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  landmark?: string;
}

// Settlement constants
const ADMIN_PERCENT = Number(process.env.ADMIN_COMMISSION_PERCENT) || 20;
const VENDOR_PERCENT = Number(process.env.VENDOR_COMMISSION_PERCENT) || 80;
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

// Create basic auth header for Razorpay API
function getRazorpayAuthHeader() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Create a payout via Razorpay Payouts API
 * In test mode, this creates a mock payout object
 * In live mode, it creates actual transfers via Razorpay
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
    const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.includes('test');
    
    if (isTestMode) {
      // In test mode, create a mock payout object instead of calling actual API
      console.log(`🧪 TEST MODE: Simulating payout...`);
      const mockPayout = {
        id: `pout_test_${Date.now()}`,
        entity: 'payout',
        fund_account_id: `fa_test_${Date.now()}`,
        account_number: payoutData.account_number,
        amount: payoutData.amount,
        currency: 'INR',
        mode: payoutData.mode,
        purpose: 'Settlement',
        status: 'processed',
        fees: 0,
        tax: 0,
        utr: `test_utr_${Date.now()}`,
        reference_id: payoutData.reference_id,
        created_at: Math.floor(Date.now() / 1000),
      };
      console.log(`✅ Test payout simulated: ${mockPayout.id}`);
      return mockPayout;
    } else {
      // In live mode, make actual API call
      console.log(`💳 LIVE MODE: Creating actual payout via Razorpay API...`);
      const response = await axios.post(`${RAZORPAY_API_URL}/payouts`, payoutData, {
        headers: {
          'Authorization': getRazorpayAuthHeader(),
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    }
  } catch (error: unknown) {
    console.error('❌ Payout API error:', error instanceof Error ? error.message : 'Unknown error');
    // Return null to let settlement process continue with failed status
    return null;
  }
}

/**
 * Process payment settlement - split between admin and vendor
 */
async function processPaymentSettlement(
  orderId: string,
  totalAmount: number,
  vendorId: string,
  vendorBankAccount?: {
    account_number: string;
    ifsc: string;
    beneficiary_name: string;
  }
) {
  try {
    const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.includes('test');
    console.log(`\n💳 PROCESSING PAYMENT SETTLEMENT... ${isTestMode ? '🧪 (TEST MODE)' : '💰 (LIVE MODE)'}`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Total Amount: ₹${totalAmount}`);
    
    const adminAmount = Math.round(totalAmount * ADMIN_PERCENT) / 100;
    const vendorAmount = Math.round(totalAmount * VENDOR_PERCENT) / 100;
    
    console.log(`Admin Commission (${ADMIN_PERCENT}%): ₹${adminAmount}`);
    console.log(`Vendor Settlement (${VENDOR_PERCENT}%): ₹${vendorAmount}`);

    let adminPayout = null;
    let vendorPayout = null;

    // Create admin payout
    try {
      const adminBankAccount = process.env.ADMIN_BANK_ACCOUNT_NUMBER;
      const adminIfsc = process.env.ADMIN_BANK_IFSC;
      const adminName = process.env.ADMIN_BANK_ACCOUNT_HOLDER || 'Purble Palace Admin';

      if (adminBankAccount && adminIfsc) {
        console.log(`📤 Creating admin payout: ₹${adminAmount}...`);
        adminPayout = await createPayout({
          account_number: adminBankAccount,
          ifsc_code: adminIfsc,
          beneficiary_name: adminName,
          amount: Math.round(adminAmount * 100), // Razorpay uses paise
          mode: 'NEFT',
          reference_id: `ADMIN-${orderId}-${Date.now()}`,
        });
        if (adminPayout?.id) {
          console.log(`✅ Admin payout created: ${adminPayout.id}`);
        }
      } else {
        console.warn(`⚠️  Admin bank account not configured`);
      }
    } catch (adminError) {
      console.error('❌ Admin payout failed:', adminError);
    }

    // Create vendor payout
    if (vendorBankAccount?.account_number) {
      try {
        console.log(`📤 Creating vendor payout: ₹${vendorAmount}...`);
        vendorPayout = await createPayout({
          account_number: vendorBankAccount.account_number,
          ifsc_code: vendorBankAccount.ifsc,
          beneficiary_name: vendorBankAccount.beneficiary_name,
          amount: Math.round(vendorAmount * 100), // Razorpay uses paise
          mode: 'NEFT',
          reference_id: `VENDOR-${orderId}-${Date.now()}`,
        });
        if (vendorPayout?.id) {
          console.log(`✅ Vendor payout created: ${vendorPayout.id}`);
        }
      } catch (vendorError) {
        console.error('❌ Vendor payout failed:', vendorError);
      }
    } else {
      console.warn(`⚠️  Vendor bank account not configured`);
    }

    // Store split record in database
    try {
      const paymentSplit = await prisma.paymentSplit.create({
        data: {
          orderId,
          totalAmount,
          adminAmount,
          vendorAmount,
          adminRazorpayTransferId: adminPayout?.id || null,
          vendorRazorpayTransferId: vendorPayout?.id || null,
          status: (adminPayout || vendorPayout) ? 'processing' : 'failed',
          adminTransferStatus: adminPayout?.status || 'pending',
          vendorTransferStatus: vendorPayout?.status || 'pending',
        },
      });
      console.log(`✅ Payment split record created: ${paymentSplit.id}`);
      const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.includes('test');
      console.log(`\n===== PAYMENT SETTLEMENT ${isTestMode ? '(TEST MODE)' : '(LIVE MODE)'} =====`);
      console.log(`Order: ${orderId}`);
      console.log(`Admin (${ADMIN_PERCENT}%): ₹${adminAmount} → ${adminPayout?.id || '❌ Failed'}`);
      console.log(`Vendor (${VENDOR_PERCENT}%): ₹${vendorAmount} → ${vendorPayout?.id || '❌ Failed'}`);
      console.log(`Status: ${paymentSplit.status}`);
      console.log(`=========================================\n`);
    } catch (dbError) {
      console.error('❌ Error storing split record:', dbError);
    }
  } catch (error) {
    console.error('❌ Settlement process failed:', error);
  }
}

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
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // ⚠️ TEMPORARY: For testing with ngrok in test mode
    // Remove this check in production!
    const skipVerification = process.env.SKIP_WEBHOOK_VERIFICATION === 'true';

    if (!skipVerification && hash !== signature) {
      console.warn('❌ WEBHOOK SIGNATURE VERIFICATION FAILED');
      console.warn(`   Webhook Secret: ${secret ? '✓ Set' : '✗ NOT SET'}`);
      console.warn(`   Expected Hash: ${signature}`);
      console.warn(`   Computed Hash: ${hash}`);
      console.warn(`   Body Length: ${body.length} bytes`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    if (skipVerification) {
      console.log('⚠️  WEBHOOK SIGNATURE VERIFICATION SKIPPED (testing only)');
    } else {
      console.log('✅ WEBHOOK SIGNATURE VERIFIED');
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    console.log(`\n========== RAZORPAY WEBHOOK RECEIVED ==========`);
    console.log(`Event Type: ${eventType}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`============================================\n`);

    // ⚠️ IMPORTANT: Only process successful payment events
    // Reject payment failures to ensure orders are NOT created
    if (eventType === 'payment_link.removed' || eventType === 'payment_link.cancelled') {
      console.warn(`❌ PAYMENT FAILED - Payment link was cancelled/removed`);
      return NextResponse.json({ 
        status: 'ok', 
        message: 'Payment failed - order not created' 
      });
    }

    // Only process payment_link.paid events (successful payments)
    if (eventType !== 'payment_link.paid') {
      console.log(`ℹ️  Ignoring event type: ${eventType} (only processing payment_link.paid)`);
      return NextResponse.json({ status: 'ok' });
    }

    console.log(`✅ Processing successful payment...`);

    const paymentLinkEntity = event.payload.payment_link.entity;
    const paymentEntity = event.payload.payment.entity;
    
    const paymentLinkId = paymentLinkEntity.id;
    const amount = paymentLinkEntity.amount / 100; // Convert from paise
    const orderId = paymentLinkEntity.notes?.order_id;

    console.log(`📋 Payment Details:`);
    console.log(`   Payment Link ID: ${paymentLinkId}`);
    console.log(`   Amount: ₹${amount}`);
    console.log(`   Order ID: ${orderId || 'N/A (Split Payment)'}`);

    // CHECK FOR SPLIT PAYMENT (find contributor by paymentLinkId)
    const contributor = await prisma.contributor.findFirst({
      where: { paymentLinkId: paymentLinkId },
      include: {
        coPayment: {
          include: { contributors: true }
        }
      }
    });

    if (contributor) {
      console.log(`\n👥 SPLIT PAYMENT DETECTED`);
      console.log(`Contributor Email: ${contributor.email}`);
        
        // Update contributor status to paid
        const updatedContributor = await prisma.contributor.update({
          where: { id: contributor.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
          }
        });

        console.log(`✅ Contributor ${updatedContributor.email} status updated to PAID`);

        // Check if all contributors are paid
        const coPayment = contributor.coPayment;
        const allPaidNow = coPayment.contributors.every(c => 
          c.id === contributor.id ? true : c.status === 'paid'
        );

        const totalPaid = coPayment.contributors.reduce((sum, c) => 
          c.id === contributor.id ? sum + c.amount : (c.status === 'paid' ? sum + c.amount : sum), 
          0
        );

        console.log(`📊 CoPayment Status: ${coPayment.contributors.filter(c => c.status === 'paid').length}/${coPayment.contributors.length} paid`);
        console.log(`💰 Total collected: ₹${totalPaid}/${coPayment.totalAmount}`);

        if (allPaidNow) {
          console.log(`✅ ALL CONTRIBUTORS PAID - Creating order and sending confirmation emails`);
          
          // ⚠️ IMPORTANT: Check if order already created to prevent duplicate processing
          if (coPayment.orderId) {
            console.warn(`⚠️  Order already created for this split payment: ${coPayment.orderId}`);
            console.log(`🛑 Skipping duplicate order creation and emails...`);
            return NextResponse.json({
              status: 'ok',
              message: 'Split payment already processed - duplicate webhook call prevented'
            });
          }
          
          // Update CoPayment status
          const updatedCoPayment = await prisma.coPayment.update({
            where: { id: coPayment.id },
            data: { 
              status: 'completed',
              completedAt: new Date(),
            }
          });

          // Extract orderData for creating the order
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const orderData = updatedCoPayment.orderData as any;
          
          console.log(`📋 OrderData structure:`, {
            hasOrderData: !!orderData,
            customerEmail: orderData?.customer?.email,
            itemsCount: orderData?.items?.length,
            firstItemVendorId: orderData?.items?.[0]?.vendorId,
            deliveryFee: orderData?.deliveryFee,
            totalAmount: coPayment.totalAmount,
          });
          
          if (orderData) {
            try {
              console.log(`📋 Creating order from split payment data...`);
              
              // ⚠️ PREVENT DUPLICATE ORDERS: Check if order already exists for this coPayment
              if (coPayment.orderId) {
                console.log(`⚠️  Order already created for this split payment: ${coPayment.orderId}`);
                console.log(`🛑 Skipping duplicate order creation...`);
                
                // Still send emails if they haven't been sent yet
                return NextResponse.json({
                  success: true,
                  message: 'Split payment already processed',
                  orderId: coPayment.orderId
                });
              }
              
              console.log(`CoPayment ID: ${coPayment.id}`);
              console.log(`Creating NEW order for CoPayment...`);
              
              // Get or create user by email
              const customerEmail = orderData.customer?.email;
              let userId = '';
              
              if (customerEmail) {
                let user = await prisma.user.findUnique({
                  where: { email: customerEmail }
                });
                
                // If user doesn't exist yet, create them
                if (!user) {
                  console.log(`👤 Creating new user for split payment: ${customerEmail}`);
                  user = await prisma.user.create({
                    data: {
                      email: customerEmail,
                      name: orderData.customer?.name || 'Customer',
                      phone: orderData.customer?.phone || '',
                    }
                  });
                }
                userId = user.id;
              } else {
                console.warn(`⚠️  No customer email found in orderData, using placeholder`);
                userId = 'split-payment-customer';
              }
              
              // Validate we have a vendor ID
              const vendorId = orderData.items?.[0]?.vendorId;
              if (!vendorId) {
                console.error(`❌ ERROR: No vendorId found in orderData.items[0]`);
                console.error(`Items:`, orderData.items);
              }
              
              console.log(`Order creation params:`, {
                orderNumber: `ORD-${Date.now()}`,
                userId,
                vendorId,
                totalAmount: coPayment.totalAmount,
                itemsCount: orderData.items?.length,
              });
              
              // Create the order
              // Calculate estimated delivery (2-4 hours from now, or use provided value)
              const estimatedDelivery = orderData.estimatedDelivery 
                ? new Date(orderData.estimatedDelivery)
                : new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours default

              const newOrder = await prisma.order.create({
                data: {
                  orderNumber: `ORD-${Date.now()}`,
                  userId: userId,
                  vendorId: vendorId || '',
                  totalAmount: coPayment.totalAmount,
                  finalAmount: coPayment.totalAmount,
                  paymentStatus: 'completed',
                  paymentMethod: 'razorpay',
                  razorpayPaymentId: paymentEntity.id,
                  status: 'confirmed',
                  splitStatus: 'split_complete',
                  deliveryAddress: orderData.deliveryAddress || {},
                  deliveryPincode: orderData.deliveryAddress?.pincode || '000000',
                  deliveryFee: orderData.deliveryFee || 0,
                  estimatedDelivery: estimatedDelivery,
                  items: orderData.items || [],
                  notes: orderData.instructions || '',
                },
              });

              console.log(`✅✅✅ ORDER SUCCESSFULLY CREATED ✅✅✅`);
              console.log(`Order ID: ${newOrder.id}`);
              console.log(`Order Number: ${newOrder.orderNumber}`);
              console.log(`User ID: ${newOrder.userId}`);
              console.log(`Vendor ID: ${newOrder.vendorId}`);
              console.log(`Status: ${newOrder.status}`);
              console.log(`Payment Status: ${newOrder.paymentStatus}`);

              // Link CoPayment to the created Order
              const linkedCoPayment = await prisma.coPayment.update({
                where: { id: coPayment.id },
                data: { orderId: newOrder.id }
              });

              console.log(`✅ Order created and linked: ${newOrder.id}`);
              console.log(`✅ CoPayment updated with orderId: ${linkedCoPayment.orderId}`);

              // SEND CONFIRMATION EMAILS
              try {
                // Get vendor details
                const vendor = await prisma.vendor.findUnique({
                  where: { id: newOrder.vendorId },
                  include: { profile: true }
                });

                const vendorAccount = await prisma.account.findUnique({
                  where: { vendorId: newOrder.vendorId }
                });

                // Send vendor email
                if (vendorAccount?.email && vendor?.name) {
                  console.log(`📧 Sending vendor notification to ${vendorAccount.email}`);
                  const items = (orderData.items || []) as OrderItemForEmail[];
                  const deliveryAddress = (orderData.deliveryAddress || {}) as DeliveryAddressForEmail;
                  
                  try {
                    await sendVendorOrderNotification(
                      vendorAccount.email,
                      vendor.name,
                      newOrder.orderNumber,
                      orderData.customer?.name?.split(' ')[0] || 'Customer',
                      orderData.customer?.email || 'customer@example.com',
                      orderData.customer?.phone || 'N/A',
                      items,
                      deliveryAddress,
                      newOrder.estimatedDelivery || new Date(),
                      newOrder.totalAmount
                    );
                    console.log(`✅ Vendor email sent`);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } catch (vendorEmailError: any) {
                    console.error(`⚠️  Failed to send vendor email:`, vendorEmailError.message);
                  }
                }

                // Send customer confirmation email
                if (orderData.customer?.email) {
                  console.log(`📧 Sending order confirmation to ${orderData.customer.email}`);
                  const items = (orderData.items || []) as OrderItemForEmail[];
                  
                  try {
                    await sendCustomerOrderConfirmation(
                      orderData.customer.email,
                      orderData.customer.name || 'Customer',
                      newOrder.orderNumber,
                      items,
                      newOrder.totalAmount,
                      newOrder.estimatedDelivery || new Date(),
                      vendor?.name || 'Purble Palace',
                      vendor?.profile?.shopPhone,
                      vendor?.profile?.shopEmail,
                      vendor?.profile?.shopAddress
                    );
                    console.log(`✅ Customer email sent`);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } catch (customerEmailError: any) {
                    console.error(`⚠️  Failed to send customer email:`, customerEmailError.message);
                  }
                }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (emailError: any) {
                console.error(`⚠️  Error sending confirmation emails:`, emailError.message);
                // Don't fail the order if emails fail
              }

              // ================== PAYMENT SETTLEMENT (20% Admin, 80% Vendor) ==================
              const vendor = await prisma.vendor.findUnique({
                where: { id: newOrder.vendorId },
                include: { profile: true }
              });

              await processPaymentSettlement(
                newOrder.id,
                newOrder.finalAmount,
                newOrder.vendorId,
                {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  account_number: (vendor?.profile as any)?.bankAccountNumber || '',
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ifsc: (vendor?.profile as any)?.bankIfsc || '',
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  beneficiary_name: (vendor?.profile as any)?.shopOwnerName || vendor?.name || 'Vendor',
                }
              );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (orderError: any) {
              console.error(`❌ ERROR creating order:`, orderError);
              console.error(`Error message:`, orderError.message);
              console.error(`Error code:`, orderError.code);
              if (orderError.meta) {
                console.error(`Error meta:`, orderError.meta);
              }
              
              // Still return ok so webhook doesn't retry, error is logged
              console.warn(`⚠️  Order creation failed but webhook marked as processed`);
            }
          } else {
            console.warn(`⚠️  No orderData found in CoPayment, order not created`);
            console.warn(`CoPayment:`, {
              coPaymentId: coPayment.id,
              hasOrderData: !!orderData,
              orderDataKeys: orderData ? Object.keys(orderData) : [],
            });
          }
        } else {
          // Update CoPayment status to partial if more than one paid
          const paidCount = coPayment.contributors.filter(c => c.status === 'paid').length;
          if (paidCount > 0) {
            await prisma.coPayment.update({
              where: { id: coPayment.id },
              data: { status: 'partial' }
            });
            console.log(`📊 CoPayment status: Still waiting for remaining contributors...`);
            console.log(`Paid: ${paidCount}/${coPayment.contributors.length}`);
          }
        }

        return NextResponse.json({ status: 'ok' });
    }

    // ================== SINGLE RAZORPAY PAYMENT (Non-Split) ==================
    console.log(`\n💳 SINGLE PAYMENT DETECTED (Not Split)`);
    console.log(`Looking for order: ${orderId}`);

    if (!orderId || orderId === 'split-payment') {
      console.warn(`❌ No valid order ID found for single payment`);
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
      console.warn(`❌ Order ${orderId} not found in database`);
      return NextResponse.json({ status: 'ok' });
    }
    // ⚠️ IMPORTANT: Check if order is already confirmed to prevent duplicate emails
    if (order.paymentStatus === 'completed') {
      console.warn(`⚠️  Order ${orderId} already confirmed at ${new Date(order.updatedAt).toISOString()}`);
      console.log(`🛑 Skipping email sending - order already processed`);
      return NextResponse.json({ 
        status: 'ok',
        message: 'Order already processed - duplicate webhook call prevented'
      });
    }
    // ✅ Payment confirmed - now update order and send emails
    console.log(`\n✅ PAYMENT CONFIRMED - Processing order...`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Amount: ₹${amount}`);
    
    // Update order payment status to completed
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'completed',
        paymentMethod: 'razorpay',
        razorpayPaymentId: paymentEntity.id,
        status: 'confirmed',
        splitStatus: 'single_complete',
      },
    });

    console.log(`✅ Order payment status updated to: COMPLETED`);

    // ================== SEND CONFIRMATION EMAILS ==================
    console.log(`\n📧 Sending confirmation emails...`);
    
    // Send vendor notification email
    const vendorAccount = await prisma.account.findUnique({
      where: { vendorId: order.vendorId },
    });

    if (vendorAccount?.email) {
      try {
        await sendVendorOrderNotification(
          vendorAccount.email,
          order.vendor?.name || 'Vendor',
          order.orderNumber,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (order.deliveryAddress as any)?.fullName || 'Customer',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (order.deliveryAddress as any)?.email || order.userId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (order.deliveryAddress as any)?.phone || '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (order.items as any) || [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (order.deliveryAddress as any) || {},
          order.estimatedDelivery || new Date(),
          order.finalAmount
        );
        console.log(`✅ Vendor notification email sent to: ${vendorAccount.email}`);
      } catch (emailError: unknown) {
        const message = emailError instanceof Error ? emailError.message : 'Unknown error';
        console.error(`⚠️  Failed to send vendor email:`, message);
        // Don't fail the order if vendor email fails
      }
    }

    // Send customer confirmation email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((order.deliveryAddress as any)?.email) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customerEmail = (order.deliveryAddress as any)?.email;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customerName = (order.deliveryAddress as any)?.fullName || 'Customer';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (order.items as any) || [];
        await sendCustomerOrderConfirmation(
          customerEmail,
          customerName,
          order.orderNumber,
          items,
          order.finalAmount,
          order.estimatedDelivery || new Date(),
          order.vendor?.name || 'Cake Shop',
          order.vendor?.profile?.shopPhone,
          order.vendor?.profile?.shopEmail,
          order.vendor?.profile?.shopAddress
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log(`✅ Customer confirmation email sent to: ${(order.deliveryAddress as any)?.email}`);
      } catch (emailError: unknown) {
        const message = emailError instanceof Error ? emailError.message : 'Unknown error';
        console.error(`⚠️  Failed to send customer email:`, message);
        // Don't fail the order if customer email fails
      }
    }

    // ================== PAYMENT SETTLEMENT (20% Admin, 80% Vendor) ==================
    await processPaymentSettlement(
      order.id,
      order.finalAmount,
      order.vendorId,
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account_number: (order.vendor?.profile as any)?.bankAccountNumber || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ifsc: (order.vendor?.profile as any)?.bankIfsc || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beneficiary_name: (order.vendor?.profile as any)?.shopOwnerName || order.vendor?.name || 'Vendor',
      }
    );

    console.log(`========== WEBHOOK PROCESSING COMPLETE ==========\n`);
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
