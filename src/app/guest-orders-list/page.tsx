import { Suspense } from 'react';
import GuestOrdersContent from './content';

export const metadata = {
  title: 'Guest Orders | PurplePalace',
  description: 'Track your orders using email',
};

export default function GuestOrdersListPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GuestOrdersContent />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen mt-20 bg-gray-50 py-12 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    </div>
  );
}
