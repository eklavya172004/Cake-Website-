import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

/**
 * Send order notification email to vendor
 */
export async function sendVendorOrderNotification(
  vendorEmail: string,
  vendorName: string,
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: OrderItemForEmail[],
  deliveryAddress: DeliveryAddressForEmail,
  estimatedDelivery: Date,
  totalAmount: number
) {
  try {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d946a6 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
            .order-section { margin-bottom: 20px; }
            .order-section h3 { color: #d946a6; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .button { display: inline-block; background: #d946a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🎂 New Order Received!</h2>
              <p style="margin: 10px 0 0 0;">Order #${orderNumber}</p>
            </div>
            <div class="content">
              <div class="order-section">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
                <p><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleString()}</p>
              </div>

              <div class="order-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Phone:</strong> ${customerPhone}</p>
              </div>

              <div class="order-section">
                <h3>Delivery Address</h3>
                <p>
                  ${deliveryAddress.fullName}<br>
                  ${deliveryAddress.address}<br>
                  ${deliveryAddress.city} ${deliveryAddress.landmark ? '(' + deliveryAddress.landmark + ')' : ''}<br>
                  Phone: ${deliveryAddress.phone}
                </p>
              </div>

              <div class="order-section">
                <h3>Items Ordered</h3>
                <table>
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d946a6;">Item</th>
                      <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d946a6;">Qty</th>
                      <th style="padding: 12px; text-align: right; border-bottom: 2px solid #d946a6;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <div style="margin-top: 30px; padding: 15px; background: #fef3f2; border-left: 4px solid #d946a6; border-radius: 4px;">
                <p style="margin: 0; color: #d946a6;">
                  <strong>⏰ Please confirm this order on your dashboard as soon as possible.</strong>
                </p>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/vendor/orders" class="button">View Order in Dashboard</a>

              <div class="footer">
                <p>This is an automated notification from Purble Palace. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'orders@purblepalace.in',
      to: vendorEmail,
      subject: `📦 New Order #${orderNumber} - Action Required!`,
      html,
    });

    console.log(`✅ Vendor notification email sent to ${vendorEmail}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send vendor email to ${vendorEmail}:`, error);
    // Don't throw - email failure shouldn't block order creation
    return null;
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendCustomerOrderConfirmation(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  items: OrderItemForEmail[],
  totalAmount: number,
  deliveryDate: Date,
  vendorName: string,
  vendorPhone?: string | null,
  vendorEmail?: string | null,
  vendorAddress?: string | null
) {
  try {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d946a6 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
            .order-section { margin-bottom: 20px; }
            .order-section h3 { color: #d946a6; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .button { display: inline-block; background: #d946a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🎉 Order Confirmed!</h2>
              <p style="margin: 10px 0 0 0;">Order #${orderNumber}</p>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>Thank you for your order! We're excited to prepare your delicious cake from <strong>${vendorName}</strong>.</p>

              <div class="order-section">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
              </div>

              <div class="order-section">
                <h3>🏪 Shop Contact Details</h3>
                <p><strong>Shop Name:</strong> ${vendorName}</p>
                ${vendorPhone ? `<p><strong>Phone:</strong> <a href="tel:${vendorPhone}" style="color: #d946a6; text-decoration: none;">${vendorPhone}</a></p>` : ''}
                ${vendorEmail ? `<p><strong>Email:</strong> <a href="mailto:${vendorEmail}" style="color: #d946a6; text-decoration: none;">${vendorEmail}</a></p>` : ''}
                ${vendorAddress ? `<p><strong>Address:</strong> ${vendorAddress}</p>` : ''}
              </div>

              <div class="order-section">
                <h3>Items Ordered</h3>
                <table>
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #d946a6;">Item</th>
                      <th style="padding: 12px; text-align: center; border-bottom: 2px solid #d946a6;">Qty</th>
                      <th style="padding: 12px; text-align: right; border-bottom: 2px solid #d946a6;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 4px;">
                <p style="margin: 0;"><strong>📞 Need help?</strong> Contact us if you have any questions about your order.</p>
              </div>

              <a href="${process.env.NEXTAUTH_URL}/orders" class="button">Track Your Order</a>

              <div class="footer">
                <p>Thank you for ordering with Purble Palace!</p>
                <p>This is an automated confirmation email. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'orders@purblepalace.in',
      to: customerEmail,
      subject: `✅ Order Confirmed - #${orderNumber}`,
      html,
    });

    console.log(`✅ Customer confirmation email sent to ${customerEmail}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send customer email to ${customerEmail}:`, error);
    // Don't throw - email failure shouldn't block order creation
    return null;
  }
}

/**
 * Send order status notification email to customer
 */
export async function sendOrderStatusNotificationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  vendorName: string,
  newStatus: string,
  estimatedDelivery: Date,
  trackingUrl: string = ''
) {
  try {
    const STATUS_MESSAGES: Record<string, { subject: string; message: string; icon: string }> = {
      confirmed: {
        icon: '✅',
        subject: 'Order Confirmed!',
        message: 'Great news! The vendor has confirmed your order and is preparing it.',
      },
      preparing: {
        icon: '👨‍🍳',
        subject: 'Your Order is Being Prepared',
        message: 'The vendor is now preparing your delicious cake!',
      },
      ready: {
        icon: '📦',
        subject: 'Your Order is Ready for Pickup',
        message: 'Your order is ready! It will be ready for delivery soon.',
      },
      delivering: {
        icon: '🚚',
        subject: 'Your Order is On The Way',
        message: 'Your order is out for delivery. Track it now!',
      },
      delivered: {
        icon: '🎉',
        subject: 'Your Order Has Arrived!',
        message: 'Your order has been delivered. We hope you enjoy your delicious cake!',
      },
      cancelled: {
        icon: '❌',
        subject: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact us.',
      },
    };

    const statusInfo = STATUS_MESSAGES[newStatus] || {
      icon: '📢',
      subject: 'Order Status Update',
      message: `Your order status has been updated to ${newStatus}`,
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d946a6 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
            .status-box { background: #f0f9ff; border-left: 4px solid #d946a6; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #d946a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">
                ${statusInfo.icon} ${statusInfo.subject}
              </h2>
              <p style="margin: 10px 0 0 0;">Order #${orderNumber}</p>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>${statusInfo.message}</p>

              <div class="status-box">
                <p style="margin: 0;">
                  <strong>Order Details:</strong><br/>
                  <strong>Order Number:</strong> ${orderNumber}<br/>
                  <strong>Vendor:</strong> ${vendorName}<br/>
                  <strong>Status:</strong> <span style="color: #d946a6; text-transform: capitalize;">${newStatus.replace(/_/g, ' ')}</span><br/>
                  <strong>Updates At:</strong> ${new Date(estimatedDelivery).toLocaleString()}
                </p>
              </div>

              ${trackingUrl ? `<a href="${trackingUrl}" class="button">Track Your Order</a>` : ''}

              <div class="footer">
                <p>Thank you for ordering with Purble Palace!</p>
                <p>This is an automated notification. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`📧 Sending order status notification to ${customerEmail} - Status: ${newStatus}`);

    const result = await resend.emails.send({
      from: 'orders@purblepalace.in',
      to: customerEmail,
      subject: `${statusInfo.icon} ${statusInfo.subject} - #${orderNumber}`,
      html,
    });

    console.log(`✅ Order status notification sent to ${customerEmail}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send order status email to ${customerEmail}:`, error);
    return null;
  }
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  token: string
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/auth/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .button:hover {
              opacity: 0.9;
            }
            .code-section {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              border-left: 4px solid #667eea;
            }
            .code-section p {
              margin: 0;
              font-size: 12px;
              color: #666;
            }
            .code {
              font-family: 'Courier New', monospace;
              word-break: break-all;
              color: #667eea;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #999;
              font-size: 12px;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .warning {
              background: #fef3cd;
              border: 1px solid #ffeeba;
              color: #856404;
              padding: 12px;
              border-radius: 5px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎂 Welcome to PurplePalace</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for joining PurblePalace! We're thrilled to have you. To complete your registration and start ordering delicious cakes, please verify your email address.</p>

              <p><strong>Verify your email by clicking the button below:</strong></p>
              
              <center>
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </center>

              <p>Or, if the button doesn't work, copy and paste this link in your browser:</p>
              <div class="code-section">
                <p>Link:</p>
                <p class="code">${verificationLink}</p>
              </div>

              <div class="warning">
                ⏱️ <strong>This link expires in 5 minutes.</strong> If you don't verify your email within this time, you'll need to request a new verification link.
              </div>

              <p>If you didn't create this account, please ignore this email.</p>

              <p>Best regards,<br><strong>The PurblePalace Team</strong></p>

              <div class="footer">
                <p>© 2026 PurblePalace. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`📧 Sending verification email to: ${email}`);
    console.log(`   Verification link: ${verificationLink}`);

    const result = await resend.emails.send({
      from: 'noreply@purblepalace.in',
      to: email,
      subject: '🎂 Verify Your PurblePalace Email Address',
      html,
    });

    console.log(`✅ Verification email sent to ${email}:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    throw error;
  }
}
