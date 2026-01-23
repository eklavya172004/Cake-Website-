import { Suspense } from 'react';
import { OrderConfirmationContent } from './order-content';

function OrderLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
        <p className="text-gray-600 font-medium">Loading your order details...</p>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderLoadingFallback />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
