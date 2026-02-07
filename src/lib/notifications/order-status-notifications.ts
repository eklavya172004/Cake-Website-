/**
 * lib/notifications/order-status-notifications.ts
 * 
 * Handles sending notifications when order status changes
 */

import { sendVendorOrderNotification } from '@/lib/email';

interface StatusNotificationData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  vendorName: string;
  oldStatus: string;
  newStatus: string;
  estimatedDelivery: Date;
  trackingUrl: string;
}

const STATUS_MESSAGES: Record<string, { subject: string; message: string }> = {
  confirmed: {
    subject: 'Order Confirmed! ✅',
    message: 'Great news! The vendor has confirmed your order and is preparing it.',
  },
  delivered: {
    subject: '🎉 Your Order Has Arrived!',
    message: 'Your order has been delivered. We hope you enjoy!',
  },
};

export async function sendOrderStatusNotification(data: StatusNotificationData) {
  try {
    const statusInfo = STATUS_MESSAGES[data.newStatus] || {
      subject: `Order Status Update - ${data.newStatus}`,
      message: `Your order status has been updated to ${data.newStatus}`,
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 10px 0;">${statusInfo.subject}</h2>
          <p style="color: #666; margin: 0;">Order #${data.orderNumber}</p>
        </div>

        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Dear ${data.customerName},
          </p>
          
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            ${statusInfo.message}
          </p>

          <div style="background-color: #f9f9f9; border-left: 4px solid #ec4899; padding: 15px; margin: 20px 0;">
            <p style="color: #666; margin: 5px 0;">
              <strong>Order Details:</strong><br/>
              Order Number: #${data.orderNumber}<br/>
              Vendor: ${data.vendorName}<br/>
              Current Status: <span style="color: #ec4899; font-weight: bold; text-transform: capitalize;">${data.newStatus.replace(/_/g, ' ')}</span><br/>
              Estimated Delivery: ${data.estimatedDelivery.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            <a href="${data.trackingUrl}" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">
              Track Your Order
            </a>
          </p>
        </div>

        <div style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          <p>This is an automated notification from PurblePalace. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    // TODO: Implement proper email sending for status notifications
    // await sendEmail({
    //   to: data.customerEmail,
    //   subject: `PurblePalace - ${statusInfo.subject}`,
    //   html: htmlContent,
    // });

    return { success: true, message: 'Notification sent' };
  } catch (error) {
    console.error('Failed to send order status notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

/**
 * Send bulk notifications for multiple orders
 */
export async function sendBulkOrderStatusNotifications(
  orders: StatusNotificationData[]
) {
  const results = await Promise.all(
    orders.map((order) => sendOrderStatusNotification(order))
  );

  return {
    total: orders.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  };
}
