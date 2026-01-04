import { Suspense } from 'react';
import SplitPaymentStatus from '@/components/checkout/SplitPaymentStatusPage';

export default function SplitPaymentStatusPageWrapper({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen  flex items-center justify-center">Loading...</div>}>
      <PaymentStatusContent params={params} />
    </Suspense>
  );
}

async function PaymentStatusContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <SplitPaymentStatus orderId={orderId} />;
}
