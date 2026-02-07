/**
 * lib/notifications/order-status-notifications.ts
 * 
 * Handles sending notifications when order status changes
 */

import { sendOrderStatusNotificationEmail } from '@/lib/email';

interface StatusNotificationData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  vendorName: string;
  oldStatus: string;
  newStatus: string;
  estimatedDelivery: Date;
  trackingUrl: string | null | undefined;
}

export async function sendOrderStatusNotification(data: StatusNotificationData) {
  try {
    // Send email notification to customer
    await sendOrderStatusNotificationEmail(
      data.customerEmail,
      data.customerName,
      data.orderNumber,
      data.vendorName,
      data.newStatus,
      data.estimatedDelivery,
      data.trackingUrl || ''
    );

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
