import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API);

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
                <p>This is an automated notification from Cake Shop. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'orders@cakeshop.com',
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
  vendorName: string
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
                <p><strong>Expected Delivery:</strong> ${new Date(deliveryDate).toLocaleString()}</p>
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
                <p>Thank you for ordering with Cake Shop!</p>
                <p>This is an automated confirmation email. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'orders@cakeshop.com',
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
