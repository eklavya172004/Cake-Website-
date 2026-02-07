# 🎂 Order Status Tracking - Quick Start Guide

## For Users (Customers)

### How to Track Your Order

#### Step 1: Place an Order
1. Browse cakes on the home page
2. Add items to cart
3. Proceed to checkout
4. Complete payment
5. You'll receive an order confirmation email

#### Step 2: Track in Real-Time
1. **Option A:** Click the tracking link in your confirmation email
2. **Option B:** Go to your profile → Order History → Click "View Details"
3. **Option C:** Visit `/orders/{orderId}` directly

#### Step 3: View Order Status
On the order tracking page, you'll see:

- **Order Number:** `ORD-2025-123456`
- **Status Timeline** showing the journey:
  ```
  📦 Order Placed (Feb 6, 10:00 AM)
     ↓
  ✅ Confirmed (Feb 6, 10:05 AM)
     ↓
  👨‍🍳 Preparing (Feb 6, 10:15 AM)
     ↓
  📋 Ready for Pickup (Feb 6, 11:00 AM)
     ↓
  🚗 Picked Up (Feb 6, 11:10 AM)
     ↓
  🚚 Out for Delivery (Feb 6, 12:30 PM)
     ↓
  🎉 Delivered (Feb 6, 1:00 PM)
  ```

#### Step 4: Auto-Refresh
- Page automatically updates every 10 seconds
- Click **Refresh** button to check immediately
- Each status update shows:
  - What changed
  - When it changed
  - Who made the change

#### Step 5: Get Notifications
You'll receive email notifications for:
- ✅ Order Confirmed
- 👨‍🍳 Order Preparing
- 📋 Ready for Pickup
- 🚗 Picked Up
- 🚚 Out for Delivery
- 🎉 Delivered

Each notification includes:
- Updated status with emoji
- Order number and vendor name
- Link to track order in real-time
- Estimated delivery time

---

## For Vendors

### How to Update Order Status

#### Step 1: Access Vendor Dashboard
1. Log in to your vendor account
2. Navigate to `/vendor/orders` or click "Orders" in sidebar

#### Step 2: View Your Orders
See all your orders with:
- Order numbers
- Customer names
- Order amounts
- **Current status** with color coding:
  - 🟡 Yellow = Pending
  - 🔵 Blue = Confirmed
  - 🟣 Purple = Preparing
  - 🟦 Indigo = Ready
  - 🔷 Cyan = Picked Up
  - 🟠 Orange = Out for Delivery
  - 🟢 Green = Delivered
  - 🔴 Red = Cancelled

#### Step 3: Update Order Status
1. **Click on the order** to expand details
2. **Click "Update Status"** button
3. **Select new status** from dropdown:
   - pending
   - confirmed
   - preparing
   - ready
   - picked_up
   - out_for_delivery
   - delivered
   - cancelled

4. **Click "Save Changes"**

#### Step 4: What Happens Automatically
When you update the status:
- ✅ Order status updated instantly
- 📝 Status history record created
- 📧 Customer receives email notification
- 🔄 Customer's tracking page updates
- 📱 If available, customer gets push notification

#### Step 5: Status Update Timeline
Each order shows a complete history with:
- All previous status changes
- Exact timestamp for each change
- Messages explaining what happened

**Example:**
```
Status History:
1. Pending - Feb 6, 10:00 AM - System - "Order placed successfully"
2. Confirmed - Feb 6, 10:05 AM - Vendor - "Order confirmed and will be prepared"
3. Preparing - Feb 6, 10:15 AM - Vendor - "Order is being prepared carefully"
```

---

## 📊 Status Reference

### Order Status Flow

```
Customer Places Order
        ↓
     PENDING ← Order awaiting vendor confirmation
        ↓
   CONFIRMED ← Vendor confirmed the order
        ↓
   PREPARING ← Cake is being made
        ↓
      READY ← Ready for pickup/delivery
        ↓
   PICKED_UP ← Delivery partner picked it up
        ↓
OUT_FOR_DELIVERY ← On the way to customer
        ↓
   DELIVERED ← Order completed! ✅
```

**OR at any stage:**
```
    CANCELLED ← Order cancelled (with reason)
```

---

## 🔔 Email Notifications Details

### When Customer Gets Notified

| Status | Email Subject | Message |
|--------|---|---|
| confirmed | Order Confirmed! ✅ | Vendor confirmed & preparing your order |
| preparing | Your Order is Being Prepared! 👨‍🍳 | Your cake is being made with care |
| ready | Your Order is Ready! 📋 | Ready for pickup or delivery |
| picked_up | Your Order is on the Way! 🚗 | Delivery partner collecting order |
| out_for_delivery | Order Out for Delivery! 🚚 | On its way to your address |
| delivered | Your Order Has Arrived! 🎉 | Order delivered successfully |

### Email Contains
- Current order status
- Order number
- Vendor name
- Estimated delivery time
- **Tracking link** to see full order details

---

## 🎯 Best Practices

### For Vendors
1. **Update status promptly** - Customers see updates in real-time
2. **Update in order** - Don't skip steps (e.g., confirm before preparing)
3. **Be honest** - Only mark ready when truly ready
4. **Communicate issues** - Cancel rather than abandon order

### For Customers
1. **Check notifications** - You'll get email alerts
2. **Watch the timeline** - See all status changes with timestamps
3. **Use tracking link** - Easy access from email
4. **Contact vendor** - If status seems stuck

---

## ❓ FAQ

### Q: How often does the tracking page update?
**A:** Automatically every 10 seconds. Click "Refresh" for immediate update.

### Q: Will I get notified of status changes?
**A:** Yes! Email notifications sent for each major status update.

### Q: Can I cancel an order?
**A:** Vendor can cancel. Contact vendor immediately if needed.

### Q: How long does delivery usually take?
**A:** Depends on your location. Check estimated delivery time in the order.

### Q: What if status seems wrong?
**A:** Contact the vendor directly. They can update or correct it.

### Q: Can I see all my orders?
**A:** Yes, go to Profile → Order History for all past and current orders.

---

## 📞 Support

### For Customers
- 📧 Email: support@purblepalace.in
- 💬 Live chat on website
- 📱 Call vendor from order details

### For Vendors
- 📧 Email: vendor-support@purblepalace.in
- 📚 Check [ORDER_STATUS_TRACKING_COMPLETE.md](ORDER_STATUS_TRACKING_COMPLETE.md) for technical details
- 🐛 Report issues on vendor dashboard

---

## 🚀 Advanced Features

### Real-time Status Polling
- Fetches order data every 10 seconds
- Shows "Refreshing..." indicator during update
- Seamless background updates

### Status History
- Complete audit trail of all changes
- Shows who made the change (vendor/system/admin)
- Displays exact timestamp
- Helpful messages explaining transitions

### Mobile Integration
- Fully responsive tracking page
- Email notifications on mobile
- Mobile-friendly order details

### Email Notifications
- Professional HTML email design
- Links to tracking page
- Complete order information
- Vendor details included

---

**Last Updated:** February 6, 2025

For technical implementation details, see [ORDER_STATUS_TRACKING_COMPLETE.md](ORDER_STATUS_TRACKING_COMPLETE.md)
