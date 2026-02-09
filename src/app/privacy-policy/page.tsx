export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-pink-700 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            Last updated: February 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to our Cake Shop. We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">2. Information We Collect</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">We may collect information about you in a variety of ways. The information we may collect on the site includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Personal Data:</strong> Name, email address, phone number, shipping address, billing address</li>
                <li><strong>Payment Information:</strong> Credit card numbers, bank account details (processed securely through Razorpay)</li>
                <li><strong>Order Information:</strong> Cake preferences, customization details, delivery dates</li>
                <li><strong>Account Information:</strong> Login credentials, profile information</li>
                <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, time spent on pages</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">3. How We Use Your Information</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">We use the information we collect in the following ways:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To process your orders and send related information</li>
                <li>To track and manage orders and deliveries</li>
                <li>To send transactional emails (order confirmations, shipping updates)</li>
                <li>To send promotional emails and marketing updates (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To prevent and detect fraudulent activities</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">4. Payment Information</h2>
            <p className="text-gray-700 leading-relaxed">
              All payment processing is handled securely through Razorpay. We do not store your complete credit card information on our servers. Your payment data is encrypted and processed according to PCI-DSS compliance standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">5. Split Payment Feature</h2>
            <p className="text-gray-700 leading-relaxed">
              When you use our split payment feature, we collect email addresses and payment information of co-payers. This information is used solely to generate payment links and process payments. Co&apos;payers&apos; information is not used for marketing purposes without their consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">6. Data Security</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure password hashing</li>
                <li>Regular security audits</li>
                <li>Restricted access to personal data</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">7. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your browsing experience. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">8. Your Rights</h2>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to delete your data</li>
                <li>Right to withdraw consent</li>
                <li>Right to data portability</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">9. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of external sites. Please review their privacy policies before providing any personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-pink-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@cakeshop.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 1234567890</p>
              <p className="text-gray-700"><strong>Address:</strong> Cake Shop, Your City, Country</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
