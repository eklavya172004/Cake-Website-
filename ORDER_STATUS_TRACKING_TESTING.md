# 🧪 Order Status Tracking - Testing Guide

## Overview

This guide provides step-by-step instructions to test the complete order status tracking feature.

---

## Prerequisites

- [ ] Vendor account created and verified
- [ ] Customer account created  
- [ ] At least one cake listed in vendor's shop
- [ ] Local environment running or staging server
- [ ] Postman or API client (optional)
- [ ] Email service configured (for notifications)

---

## Test Scenarios

### Scenario 1: Complete Order-to-Delivery Flow

#### Test Case 1.1: Generate Test Order
**Goal:** Create a test order to track

**Steps:**
1. Log out or use incognito (customer perspective)
2. Navigate to shop home `/`
3. Find vendor's cake
4. Add 1 cake to cart
5. Click "Checkout"
6. Fill delivery details:
   - Full Name: Test Customer
   - Email: test@example.com
   - Phone: 9999999999
   - Address: Test Address
   - City: Bangalore
   - Pincode: 560001
7. Select delivery type
8. Choose payment method (COD for faster testing)
9. Review order
10. Click "Place Order"

**Expected Result:**
- ✅ Order created successfully
- ✅ Get order number (e.g., `ORD-2025-123456`)
- ✅ Confirmation email sent
- ✅ Redirected to order tracking page

**Verification:**
```bash
# Check database
SELECT * FROM "Order" WHERE orderNumber LIKE 'ORD-%' ORDER BY createdAt DESC LIMIT 1;

# Should show status: 'pending'
```

---

#### Test Case 1.2: View Order Tracking (Customer)
**Goal:** Verify customer can view order and status timeline

**Steps:**
1. From order confirmation, click "Track Order" or visit `/orders/{orderId}`
2. Observe order details

**Expected Result:**
```
Order Tracking Page Shows:
├── Order Number: ORD-2025-123456
├── Status Timeline:
│   ├── 📦 Order Placed (Current Stage) ✅
│   ├── ✅ Confirmed (Greyed out)
│   ├── 👨‍🍳 Preparing (Greyed out)
│   ├── 📋 Ready for Pickup (Greyed out)
│   ├── 🚗 Picked Up (Greyed out)
│   ├── 🚚 Out for Delivery (Greyed out)
│   └── 🎉 Delivered (Greyed out)
├── Order Details:
│   ├── Items: [Cake name, quantity, price]
│   ├── Delivery Address: [Full address]
│   ├── Estimated Delivery: [Date/Time]
│   └── Payment Status: [Status]
└── Refresh Button (works)
```

**Verification:**
```typescript
// Should match this structure
{
  "id": "order-id",
  "orderNumber": "ORD-2025-123456",
  "status": "pending",
  "items": [...],
  "statusHistory": [
    {
      "id": "history-1",
      "status": "pending",
      "message": "Order placed successfully. Waiting for vendor confirmation.",
      "createdBy": "system",
      "createdAt": "2025-02-06T10:00:00Z"
    }
  ]
}
```

---

#### Test Case 1.3: Vendor Updates to Confirmed
**Goal:** Vendor confirms order, status updates for customer

**Steps (Vendor):**
1. Log in as vendor
2. Navigate to `/vendor/orders`
3. Find the test order by order number
4. Click on order to expand
5. Click "Update Status" button
6. Select "confirmed" from dropdown
7. Click "Save Changes"

**Expected Result:**
- ✅ Status updated immediately to "confirmed"
- ✅ Order status history record created
- ✅ Email notification sent to customer
- ✅ UI refreshes showing new status
- ✅ Order badge changes from yellow to blue

**Verification:**
```bash
# Check database
SELECT * FROM "OrderStatusHistory" WHERE orderId = 'order-id' ORDER BY createdAt;

# Should show:
# 1. pending - system - "Order placed successfully..."
# 2. confirmed - vendor - "Order status updated to confirmed by vendor"
```

**Check Email:**
1. Check test customer email (test@example.com)
2. Should have received: "Order Confirmed! ✅"
3. Email should contain:
   - Order number
   - Vendor name
   - Status message
   - Tracking link

---

#### Test Case 1.4: Customer Sees Updated Status
**Goal:** Verify customer tracking page shows confirmation

**Steps (Customer):**
1. Go back to `/orders/{orderId}` (or refresh)
2. Observe status changes

**Expected Result:**
```
Status Timeline Updated:
├── 📦 Order Placed (Completed) ✅ - 10:00 AM
├── ✅ Confirmed (Current Stage) ✅ - 10:05 AM ← NEW!
├── 👨‍🍳 Preparing (Greyed out)
│   ... rest of timeline
```

Timeline shows:
- ✅ Checkmark for pending (completed)
- ✅ Checkmark for confirmed (current)
- Message: "Order status updated to confirmed by vendor"
- Timestamp: 10:05 AM on Feb 6

---

#### Test Case 1.5: Continue Status Updates
**Goal:** Test remaining status transitions

**Steps (Repeat for each status):**

##### Update 2: Confirmed → Preparing
1. Vendor updates order to "preparing"
2. Customer notification email sent
3. Verify status history created
4. Customer sees update on tracking page

##### Update 3: Preparing → Ready
1. Vendor updates order to "ready"
2. Email notification sent
3. Verify in database

##### Update 4: Ready → Picked Up
1. Vendor updates order to "picked_up"
2. Email notification sent

##### Update 5: Picked Up → Out for Delivery
1. Vendor updates order to "out_for_delivery"
2. Email notification sent

##### Update 6: Out for Delivery → Delivered
1. Vendor updates order to "delivered"
2. Email notification sent
3. Final status shows "🎉 Delivered"

**Final Expected Result:**
```
Complete Timeline:
┌─ 📦 Order Placed (2:00 PM) ✅
├─ ✅ Confirmed (2:05 PM) ✅
├─ 👨‍🍳 Preparing (2:15 PM) ✅
├─ 📋 Ready (3:00 PM) ✅
├─ 🚗 Picked Up (3:10 PM) ✅
├─ 🚚 Out for Delivery (4:30 PM) ✅
└─ 🎉 Delivered (5:00 PM) ✅

Status History Count: 7 records
```

---

### Scenario 2: Status History Audit Trail

**Goal:** Verify complete audit trail is maintained

**Test Steps:**
1. Open the order tracking page
2. Scroll through all status entries
3. Verify each entry shows:
   - Status name
   - Message
   - Timestamp
   - Who made the change (vendor/system)

**Verification Query:**
```sql
SELECT 
  status,
  message,
  "createdBy",
  "createdAt"
FROM "OrderStatusHistory"
WHERE "orderId" = 'your-order-id'
ORDER BY "createdAt" ASC;
```

**Expected Output:**
```
status    | message                                    | createdBy | createdAt
----------|--------------------------------------------|-----------|-----------
pending   | Order placed successfully...               | system    | 2025-02-06 10:00:00
confirmed | Order status updated to confirmed by vendor | vendor    | 2025-02-06 10:05:00
preparing | Order status updated to preparing by vendor | vendor    | 2025-02-06 10:15:00
ready     | Order status updated to ready by vendor    | vendor    | 2025-02-06 11:00:00
...
```

---

### Scenario 3: Order Cancellation

**Goal:** Test cancel status

**Steps:**
1. Create fresh order (following Scenario 1.1)
2. Vendor goes to `/vendor/orders`
3. Selects the order
4. Clicks "Update Status"
5. Selects "cancelled"
6. Saves changes

**Expected Result:**
- ✅ Status changed to "cancelled"
- ✅ Red status badge shown
- ✅ Status history record created
- ✅ Cancellation email sent to customer
- ✅ Order removed from active orders (if filtered)

**Verification:**
```bash
SELECT status FROM "Order" WHERE id = 'order-id';
# Result: cancelled
```

---

### Scenario 4: Real-time Auto-Refresh

**Goal:** Verify auto-refresh polling works

**Steps (Customer):**
1. Open order tracking page at `/orders/{orderId}`
2. Open browser console (F12)
3. Look at Network tab
4. Wait 10 seconds
5. Observe network request

**Expected Result:**
- Every 10 seconds: GET request to `/api/orders?id={orderId}`
- Response includes latest status
- Page updates to show newest status
- No console errors

**Manual Verification:**
```javascript
// In browser console
// Should log every 10 seconds
setInterval(() => {
  console.log('Polling for order updates...');
}, 10000);
```

---

### Scenario 5: Manual Refresh Button

**Goal:** Test manual refresh functionality

**Steps (Customer):**
1. Open order tracking page
2. Click "Refresh" button
3. Observe button state

**Expected Result:**
- ✅ Button shows "Refreshing..." 
- ✅ Button is disabled during refresh
- ✅ Status updates immediately
- ✅ Button returns to "Refresh"

---

### Scenario 6: Notification Email Validation

**Goal:** Verify emails are formatted correctly

**Steps:**
1. Set up email testing service (Mailtrap, Gmail dev account, etc.)
2. Create order
3. Vendor updates status
4. Check email inbox

**Expected Result:**

Each email should contain:
```
Subject: PurblePalace - Order Confirmed! ✅
From: no-reply@purblepalace.in
To: customer@email.com

Body:
- Professional HTML formatting
- Order number clearly visible
- Current status highlighted in pink
- Vendor name
- Estimated delivery date/time
- "Track Your Order" button (clickable link)
- All order details if applicable
```

**Example Email Check:**
```
✅ Subject line includes status emoji
✅ Customer name in greeting
✅ Order number displays as ORD-XXXX-XXXXXX
✅ Vendor name clearly shown
✅ Status highlighted
✅ Tracking link works: /orders/{orderId}
✅ Professional footer with no-reply notice
```

---

### Scenario 7: Mobile Responsiveness

**Goal:** Verify tracking page works on mobile

**Steps:**
1. Open order tracking page on mobile device
2. Or use browser dev tools (F12, toggle device toolbar)
3. Verify layout

**Expected Result:**
```
Mobile View (< 768px):
├── Order number prominent at top
├── Status timeline single column (not side-by-side)
├── Status badges stack vertically
├── Order details card takes full width
├── Refresh button is easily tappable
├── Scroll smoothly through timeline
└── No horizontal overflow
```

---

## Error Handling Tests

### Test Case: Invalid Order ID
**Goal:** Verify proper error handling

**Steps:**
1. Visit `/orders/invalid-id-123`
2. Observe error message

**Expected Result:**
```
Page shows:
"Order not found"
"Go to Dashboard" button (links to /profile)
```

**API Response:**
```json
{
  "error": "Order not found"
}
```

---

### Test Case: Unauthorized Access
**Goal:** Verify users can't see others' orders

**Steps:**
1. User A places order
2. User B tries to access User A's order via API
3. Make request: `GET /api/orders?id={userAOrderId}`

**Expected Result:**
```json
{
  "error": "Unauthorized"
}
Status: 401
```

---

### Test Case: Invalid Status Update
**Goal:** Verify invalid status values rejected

**Steps (API):**
```bash
curl -X PUT http://localhost:3000/api/vendor/orders/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "invalid_status"
  }'
```

**Expected Result:**
```json
{
  "error": "Invalid status"
}
Status: 400
```

---

## Performance Tests

### Test Case: Large Status History
**Goal:** Verify page performance with many status updates

**Steps:**
1. Create order
2. Update status 50 times (via API or loop)
3. Load tracking page
4. Measure page load time

**Expected Result:**
- Page loads in < 2 seconds
- Timeline renders without lag
- Scroll is smooth
- No memory leaks

---

### Test Case: Concurrent Status Updates
**Goal:** Test race condition safety

**Steps:**
1. Create order
2. Make 3 simultaneous PUT requests to update status
3. Verify results

**Expected Result:**
- Last update wins
- Only 3 status history records created
- No database corruption
- No duplicate records

---

## Database Verification Checklist

After completing all tests, verify:

```sql
-- Check order count
SELECT COUNT(*) FROM "Order";

-- Check status history count
SELECT COUNT(*) FROM "OrderStatusHistory";

-- Verify no orphaned records
SELECT o.id, COUNT(h.id) as history_count
FROM "Order" o
LEFT JOIN "OrderStatusHistory" h ON o.id = h."orderId"
GROUP BY o.id
HAVING COUNT(h.id) = 0;  -- Should return 0 rows

-- Verify status transitions are logical
SELECT 
  o.id,
  o.status,
  COUNT(h.id) as transitions
FROM "Order" o
JOIN "OrderStatusHistory" h ON o.id = h."orderId"
GROUP BY o.id, o.status
HAVING COUNT(h.id) > 10;  -- Flag unusual patterns
```

---

## Sign-Off Checklist

- [ ] Scenario 1: Complete order flow tested
- [ ] Scenario 2: Status history audit trail verified  
- [ ] Scenario 3: Cancellation tested
- [ ] Scenario 4: Auto-refresh polling verified
- [ ] Scenario 5: Manual refresh works
- [ ] Scenario 6: Notification emails validated
- [ ] Scenario 7: Mobile responsiveness confirmed
- [ ] Error handling tests passed
- [ ] Performance tests pass
- [ ] Database integrity verified
- [ ] No console errors
- [ ] No unhandled promises
- [ ] Email service configured
- [ ] All status transitions tested
- [ ] Authorization checks working

---

## Bug Reporting Template

If you find issues, create a bug report:

```markdown
## Bug Title

### Reproduction Steps
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Screenshots/Logs
[Attach images or error logs]

### Environment
- Browser: Chrome 120
- Device: Desktop/Mobile
- OS: Windows/Mac/Linux
- Time: When it occurred
```

---

## Support

For questions or issues with testing:
- Check [ORDER_STATUS_TRACKING_COMPLETE.md](ORDER_STATUS_TRACKING_COMPLETE.md) for implementation details
- Review [ORDER_STATUS_TRACKING_QUICKSTART.md](ORDER_STATUS_TRACKING_QUICKSTART.md) for user guide
- Check database logs: `logs/vendor_orders.log`

---

**Last Updated:** February 6, 2025
**Test Coverage:** 100% functionality
**Estimated Test Time:** 30-45 minutes
