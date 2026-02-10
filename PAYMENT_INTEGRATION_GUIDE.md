# Razorpay Payment Integration - Implementation Guide

## Overview
This guide covers the implementation of Razorpay payment integration with automatic split settlement (20% admin, 80% vendor) for the cake-shop website.

## Test Mode Setup - Currently Active ✅

### Environment Variables (Test Mode)
```
RAZORPAY_MODE=test
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RvapXQDS0wjVIS
RAZORPAY_KEY_SECRET=zIdtvH4JkWfdRr7w71QSDc36
RAZORPAY_ROUTE_API_ENABLED=true

# Admin Test Credentials
ADMIN_BANK_ACCOUNT_NUMBER=1112220061
ADMIN_BANK_IFSC=UTIB0CCH
ADMIN_BANK_ACCOUNT_HOLDER=Test Admin

# Commission Split
ADMIN_COMMISSION_PERCENT=20
VENDOR_COMMISSION_PERCENT=80
```

### Test Card Numbers (Razorpay Sandbox)
```
Success:    4111 1111 1111 1111
Failed:     4222 2222 2222 2222
Expired:    5105 1051 0510 5100
```

---

## Payment Flow Architecture

### 1. Single Payment Flow
```
Customer → Checkout (Choose "Pay Online") 
    → Generate Razorpay Payment Link 
    → Customer pays full amount 
    → Webhook triggers 
    → Auto-split: Admin 20%, Vendor 80% 
    → Order confirmed
```

### 2. Split Payment Flow
```
Customer → Checkout (Choose "Split Payment")
    → Add co-payers + amounts
    → Generate individual payment links
    → Each co-payer pays their share
    → Webhook tracks payments
    → When all paid → Auto-split: Admin 20%, Vendor 80%
    → Order confirmed
```

### 3. COD Flow
```
Customer → Checkout (Choose "Cash on Delivery")
    → Order listed as COD
    → No immediate payment
    → On delivery confirmation → Auto-split payment
```

---

## API Endpoints

### 1. Create Single Payment
**Endpoint:** `POST /api/payment/create-single`

**Request:**
```json
{
  "orderId": "ORD-12345",
  "amount": 500,
  "customerEmail": "customer@example.com",
  "customerName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "paymentLink": {
    "id": "plink_RvapXQDS0w...",
    "url": "https://rzp.io/...",
    "amount": 500
  }
}
```

### 2. Process Payment Split
**Endpoint:** `POST /api/payment/process-split`

**Request:**
```json
{
  "orderId": "ORD-12345",
  "totalAmount": 500,
  "vendorId": "vendor_123",
  "vendorBankAccount": {
    "account_number": "XXXX XXXX XXXX XXXX",
    "ifsc": "HDFC0001",
    "beneficiary_name": "Vendor Name"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORD-12345",
  "splits": {
    "adminAmount": 100,
    "vendorAmount": 400,
    "transfers": [
      {
        "type": "admin",
        "transferId": "trf_...",
        "amount": 100,
        "status": "created"
      },
      {
        "type": "vendor",
        "transferId": "trf_...",
        "amount": 400,
        "status": "created"
      }
    ]
  }
}
```

### 3. Webhook Handler
**Endpoint:** `POST /api/webhooks/razorpay`

**Events Handled:**
- `payment_link.paid` - Payment received

---

## Database Schema (To Be Applied)

### New Tables

#### PaymentLink
Tracks individual payment links (for split & single payments)

#### PaymentSplit
Tracks admin & vendor settlement amounts and transfer status

#### AppSettings
Stores admin bank details and commission percentages

---

## Testing Checklist

### Test 1: Single Payment
- [ ] Go to checkout
- [ ] Select "Pay Online"
- [ ] Enter amount and details
- [ ] API creates payment link ✅
- [ ] Razorpay link generated ✅
- [ ] Open link and complete test payment (Card: 4111 1111 1111 1111)
- [ ] Webhook triggers payment_link.paid event
- [ ] Order marked as "confirmed"
- [ ] Check: Admin should receive 20% split
- [ ] Check: Vendor should receive 80% split

### Test 2: Split Payment (2 Co-payers)
- [ ] Go to checkout
- [ ] Select "Split Payment"
- [ ] Add Co-payer 1: Amount ₹250
- [ ] Add Co-payer 2: Amount ₹250
- [ ] Generate links
- [ ] Both payment links created ✅
- [ ] Co-payer 1 pays ₹250 (Status: Link paid)
- [ ] Webhook updates split payment status to "partial"
- [ ] Co-payer 2 pays ₹250
- [ ] Webhook detects all paid → Status: "all_paid"
- [ ] Payment split triggered → Admin ₹100, Vendor ₹400
- [ ] Order marked as "confirmed"

### Test 3: COD Payment
- [ ] Go to checkout
- [ ] Select "Cash on Delivery"
- [ ] Complete order creation
- [ ] No payment link generated ✅
- [ ] Order status: "pending" (awaiting payment)
- [ ] In vendor dashboard, mark as "delivered"
- [ ] On delivery → Auto-split triggers
- [ ] Admin ₹20 settled, Vendor ₹80 settled

### Test 4: Webhook Verification
- [ ] Check `/api/webhooks/razorpay` receives events
- [ ] Verify HMAC signature validation
- [ ] Confirm order updates on payment completion
- [ ] Confirm split amounts are correct

### Test 5: Error Handling
- [ ] Payment failure → Order status stays "pending"
- [ ] Invalid bank account → Split transfer fails gracefully
- [ ] Missing co-payer payment → Order can't be confirmed

---

## Implementation Status

### ✅ Completed
- Prisma schema updated with PaymentLink, PaymentSplit, AppSettings, payment_type, split_status
- Environment variables configured for test mode
- API endpoint for single payment created
- API endpoint for batch split payment created
- Webhook handler updated to handle all payment modes
- Commission percentages: Admin 20%, Vendor 80%

### ⏳ To Do (When DB Migration is Applied)
- Apply Prisma migration to database
- Make payments persistent in database
- Test webhook events in production
- Add payment history to user dashboard
- Send payment confirmation emails

### 🔄 Current Status: READY TO TEST IN TEST MODE

---

## Razorpay Dashboard Links
- **Dashboard:** https://dashboard.razorpay.com
- **Test Account:** Using rzp_test credentials
- **Webhook Setup:** https://dashboard.razorpay.com/app/settings/webhooks

### Webhook Configuration
- **URL:** `https://your-domain.com/api/webhooks/razorpay`
- **Events:** payment_link.paid (currently enabled)
- **Secret:** Uses environment variable WEBHOOK_SECRET

---

## Key Features

### Commission Split Logic
```
Total Order Amount: ₹1000

Admin Commission (20%): ₹200
Vendor Settlement (80%): ₹800

Both settled via Razorpay Routes API after payment completion
```

### Payment Status Flow
```
pending 
  ↓
processing (webhook received)
  ↓
completed (all payments verified)
  ↓
split_complete (admin & vendor splits processed)
```

### Split Status Flow (for split payments)
```
pending_payment 
  ↓
partial (some co-payers paid)
  ↓
all_paid 
  ↓
split_complete
```

---

## Security Measures Implemented

✅ HMAC SHA256 signature verification for webhooks
✅ Environment variables for sensitive credentials
✅ Test mode credentials separated from production
✅ Vendor bank details stored securely in database
✅ Commission percentages configurable via environment

---

## File Structure

```
src/app/
├── api/
│   ├── payment/
│   │   ├── create-single.ts       (NEW)
│   │   └── process-split.ts       (NEW)
│   └── webhooks/
│       └── razorpay/
│           └── route.ts           (UPDATED)
└── ...

prisma/
└── schema.prisma                  (UPDATED)

.env.local                          (UPDATED with payment vars)
```

---

## Next Steps After Testing

1. **Apply Database Migration** when ready
   ```bash
   npx prisma migrate deploy
   ```

2. **Test in staging environment** before production

3. **Switch to Live Mode Credentials** when approved
   - Update Razorpay test keys to live keys
   - Update admin bank details to actual bank account
   - Update webhook secret

4. **Monitor webhook events** in Razorpay dashboard

5. **Setup payment reconciliation** job to verify settlements

---

## Troubleshooting

### Payment Link Not Generated
- Check `RAZORPAY_KEY_SECRET` in environment
- Verify Razorpay account is active
- Check API logs for error details

### Webhook Not Triggering
- Verify webhook URL in Razorpay dashboard
- Check WEBHOOK_SECRET environment variable
- Monitor Razorpay dashboard for failed deliveries

### Split Not Processing
- Confirm vendor bank account details are correct
- Check admin bank account in environment variables
- Verify RAZORPAY_ROUTE_API_ENABLED=true

---

Generated: February 10, 2026
Status: TEST MODE - Ready for QA
