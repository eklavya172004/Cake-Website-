import { Suspense } from 'react';
import SplitPaymentTracker from '@/components/checkout/SplitPaymentTracker';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SplitPaymentStatusPageWrapper({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen mt-28 flex items-center justify-center">Loading...</div>}>
      <PaymentStatusContent params={params} />
    </Suspense>
  );
}

async function PaymentStatusContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId: coPaymentId } = await params;  // coPaymentId is passed as orderId param

  return (
    <div className="min-h-screen mt-28 bg-gradient-to-br from-pink-50 to-purple-50 py-12 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Links Sent! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Track the payment status of your co-payers below
          </p>
        </div>

        <div className="space-y-6">
          <SplitPaymentTracker coPaymentId={coPaymentId} />

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">ℹ️ What happens next?</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>✓ Payment links have been sent to all co-payers</li>
              <li>✓ Each person will receive an email with their personalized payment link</li>
              <li>✓ Once all payments are received, your order will be auto-confirmed</li>
              <li>✓ You'll receive an order confirmation email when ready</li>
              <li>✓ Your order will be prepared and delivered as scheduled</li>
            </ul>
          </div>

          <div className="text-center">
            <Link
              href="/profile/orders"
              className="inline-block px-8 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
