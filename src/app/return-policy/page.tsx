export default function ReturnPolicy() {
  return (
    <div className="min-h-screen mt-24 bg-linear-to-br from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-pink-700 mb-8">Return & Refund Policy</h1>
          
          <p className="text-gray-600 mb-6">
            Last updated: February 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At our Cake Shop, we want you to be completely satisfied with your order. This policy outlines our return, exchange, and refund procedures for orders placed through our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">2. Nature of Products</h2>
            <p className="text-gray-700 leading-relaxed">
              Please note that cakes are perishable food items. Once delivered, cakes must be consumed within the recommended timeframe and cannot be exchanged or returned due to food safety regulations. Therefore, our return policy focuses on order cancellations and quality issues.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">3. Cancellation Policy</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4"><strong>Full Refund (100%):</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Cancellations made 48 hours or more before the delivery date</li>
                <li>Cancellations due to vendor unavailability</li>
              </ul>
              
              <p className="mb-4"><strong>Partial Refund (50%):</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Cancellations made 24-48 hours before delivery</li>
                <li>Refund will be 50% of the order amount</li>
              </ul>

              <p className="mb-4"><strong>No Refund:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellations made less than 24 hours before delivery</li>
                <li>Order already prepared or out for delivery</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">4. Quality Issues and Complaints</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">If your cake arrives damaged, incorrect, or doesn&apos;t meet the specifications:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Report the issue within <strong>2 hours of delivery</strong></li>
                <li>Provide photographic evidence of the issue</li>
                <li>Contact our customer support team with your order number</li>
              </ul>
              
              <p className="mb-4"><strong>Resolution Options:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Full refund if the cake is inedible</li>
                <li>Replacement cake (if time permits)</li>
                <li>Partial refund (20-50%) for minor quality issues</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">5. Refund Processing Timeline</h2>
            <div className="text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refunds are processed within 5-7 business days after approval</li>
                <li>The time taken for the refund to reflect depends on your bank/payment gateway</li>
                <li>For split payments, each co-payer receives their refund proportionally</li>
                <li>Razorpay charges may not be refunded (as per payment gateway policies)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">6. Split Payment Refunds</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">When an order with split payment is cancelled or refunded:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Each co-payer receives a proportional refund based on their contribution</li>
                <li>Refunds are issued to the original payment source (payment link used)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">7. Non-Refundable Items</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">The following are non-refundable:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payment gateway charges and convenience fees</li>
                <li>Orders completed and delivered as per specifications</li>
                <li>Orders cancelled due to customer&apos;s change of mind (subject to cancellation timing)</li>
                <li>Customization fees for special requests</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">8. Delivery Issues</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4"><strong>Late Delivery:</strong></p>
              <p className="mb-4">
                We strive for timely delivery. If your cake arrives more than 2 hours late, contact us immediately. We may offer a discount on future orders or handle other compensation as appropriate.
              </p>
              
              <p className="mb-4"><strong>Non-Delivery:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>If the cake cannot be delivered due to incorrect address, a full refund will be issued</li>
                <li>You are responsible for providing accurate delivery details</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">9. Payment Method-Specific Terms</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4"><strong>Credit/Debit Cards:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Refunds are processed to the same card used for payment</li>
                <li>Processing time: 5-7 business days</li>
              </ul>

              <p className="mb-4"><strong>UPI/Wallets:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Refunds appear in your UPI/wallet account automatically</li>
                <li>Processing time: 2-4 business days</li>
              </ul>

              <p className="mb-4"><strong>Cash on Delivery (COD):</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refunds for COD orders are issued via bank transfer</li>
                <li>Bank details will be requested at the time of refund</li>
                <li>Processing time: 7-10 business days</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">10. Disputes and Chargebacks</h2>
            <p className="text-gray-700 leading-relaxed">
              If you file a chargeback or dispute with your bank without attempting to resolve the issue through our customer support, you may lose access to our services. We encourage all customers to contact us first for resolution.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">11. How to Request a Refund</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">To request a cancellation or refund:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Log in to your account and go to &quot;My Orders&quot;</li>
                <li>Select the order and click &quot;Cancel Order&quot; or &quot;Request Refund&quot;</li>
                <li>Provide the reason for cancellation/refund</li>
                <li>For quality issues, upload supporting photos</li>
                <li>Submit your request</li>
                <li>Our team will review and respond within 24-48 hours</li>
              </ol>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For refund requests or to discuss a return/quality issue:
            </p>
            <div className="mt-4 p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> refunds@cakeshop.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 1234567890</p>
              <p className="text-gray-700"><strong>Support Hours:</strong> Monday - Sunday, 9:00 AM - 6:00 PM</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">13. Changes to Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to change this Return & Refund Policy at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website signifies your acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
