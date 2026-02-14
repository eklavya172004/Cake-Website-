'use client';
import { useEffect, useState, useRef } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface Contributor {
  id: string;
  email: string;
  name: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paidAt?: string;
}

interface SplitPaymentTracker {
  coPaymentId: string;
  orderId: string;
  totalAmount: number;
  collectedAmount: number;
  status: string;
  contributors: Contributor[];
  stats: {
    totalContributors: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    allPaid: boolean;
    completionPercentage: number;
  };
  createdAt: string;
  completedAt?: string;
  customerEmail?: string;
}

export default function SplitPaymentTracker({
  coPaymentId,
  orderId,
}: {
  coPaymentId?: string;
  orderId?: string;
}) {
  const [tracker, setTracker] = useState<SplitPaymentTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const hasRedirectedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const params = new URLSearchParams();
        if (coPaymentId) params.append('coPaymentId', coPaymentId);
        if (orderId) params.append('orderId', orderId);

        const response = await fetch(
          `/api/split-payment/status?${params.toString()}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load tracking');
        }

        const data = await response.json();
        setTracker(data);
        
        // Check if all paid and haven't redirected yet
        if (data?.stats?.allPaid && !hasRedirectedRef.current) {
          console.log('✅ All payments received! Initiating redirect...');
          hasRedirectedRef.current = true;
          setRedirecting(true);
          
          // Stop polling immediately
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          // Execute redirect after brief delay
          setTimeout(() => {
            const customerEmail = data?.customerEmail;
            const actualOrderId = data?.orderId || orderId;
            console.log('🔄 Executing redirect with email:', customerEmail, 'orderId:', actualOrderId);
            
            // Redirect to order confirmation page
            const confirmationUrl = `/order-confirmation?orderId=${actualOrderId}&email=${encodeURIComponent(customerEmail)}&coPaymentId=${coPaymentId}`;
            console.log(`🔄 Redirecting to: ${confirmationUrl}`);
            window.location.href = confirmationUrl;
          }, 1000);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading split payment status');
      } finally {
        setLoading(false);
      }
    };

    if ((coPaymentId || orderId) && !hasRedirectedRef.current) {
      // Initial fetch
      fetchStatus();
      
      // Start polling only if not already redirected
      pollingIntervalRef.current = setInterval(fetchStatus, 5000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [coPaymentId, orderId]);

  if (loading) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading payment status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <div className="flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <p className="text-xs text-red-600 mt-2">Try refreshing the page or contact support</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tracker) return null;

  const progressPercentage = tracker.stats.completionPercentage;

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg shadow-md p-6 border border-pink-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-pink-700 mb-2">
          Split Payment Tracker
        </h2>
        <p className="text-gray-600 text-sm">
          {tracker.orderId ? (
            <>Order ID: <span className="font-mono font-semibold text-gray-900">{tracker.orderId}</span></>
          ) : (
            <>Payment Reference: <span className="font-mono font-semibold text-gray-900">{coPaymentId || 'Processing...'}</span></>
          )}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-pink-600">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-pink-600 to-purple-600 h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">
            ₹{tracker.totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 mb-1">Collected</p>
          <p className="text-lg font-bold text-green-700">
            ₹{tracker.collectedAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700 mb-1">Pending</p>
          <p className="text-lg font-bold text-yellow-700">
            ₹
            {(tracker.totalAmount - tracker.collectedAmount).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="text-xs text-gray-600">Paid</p>
            <p className="font-bold text-gray-900">{tracker.stats.paidCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200">
          <Clock size={20} className="text-yellow-600" />
          <div>
            <p className="text-xs text-gray-600">Pending</p>
            <p className="font-bold text-gray-900">
              {tracker.stats.pendingCount}
            </p>
          </div>
        </div>
      </div>

      {/* Contributors List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-700">Payment Details</h3>
        </div>

        <div className="divide-y">
          {tracker.contributors.map((contributor) => (
            <div
              key={contributor.id}
              className="p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {contributor.name}
                  </p>
                  <p className="text-sm text-gray-600 break-all">
                    {contributor.email}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ₹{contributor.amount.toFixed(2)}
                  </p>

                  {contributor.status === 'paid' && (
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-xs text-green-600 font-semibold">
                        Paid
                      </span>
                    </div>
                  )}

                  {contributor.status === 'pending' && (
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <Clock size={16} className="text-yellow-600" />
                      <span className="text-xs text-yellow-600 font-semibold">
                        Awaiting
                      </span>
                    </div>
                  )}

                  {contributor.status === 'failed' && (
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <XCircle size={16} className="text-red-600" />
                      <span className="text-xs text-red-600 font-semibold">
                        Failed
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {contributor.paidAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Paid on{' '}
                  {new Date(contributor.paidAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Badge */}
      {tracker.stats.allPaid && (
        <div className={`mt-6 p-4 bg-green-50 border border-green-300 rounded-lg flex gap-3 transition-all ${redirecting ? 'animate-pulse' : ''}`}>
          <CheckCircle className="text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-800">🎉 All Payments Received!</p>
            <p className="text-sm text-green-700 mb-3">
              Your order has been confirmed and will be prepared shortly.
            </p>
            <div className="flex items-center gap-3 flex-wrap mt-4">
              {redirecting && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                    <p className="text-sm font-medium text-green-800">
                      Redirecting...
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">or</p>
                </>
              )}
              
              <button 
                onClick={() => {
                  const customerEmail = tracker.customerEmail;
                  console.log('View Orders button clicked, customerEmail:', customerEmail);
                  
                  if (customerEmail) {
                    const url = `/guest-orders-list?email=${encodeURIComponent(customerEmail)}`;
                    console.log('Navigating to:', url);
                    window.location.href = url;
                  } else {
                    console.log('No customer email, trying /orders');
                    window.location.href = '/orders';
                  }
                }}
                className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 transition font-medium text-sm bg-green-100 hover:bg-green-200 px-4 py-2 rounded cursor-pointer"
              >
                <span>View My Orders</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tracker.stats.pendingCount > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">
              Waiting for {tracker.stats.pendingCount} payment
              {tracker.stats.pendingCount > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-yellow-700">
              Your order will be confirmed once all co-payers complete payment.
            </p>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700">
        <p className="font-mono mb-2">📋 Debug Info:</p>
        <p>CoPaymentId: {coPaymentId}</p>
        <p>OrderId: {tracker.orderId}</p>
        <p>Customer Email: {tracker.customerEmail || '❌ Not found'}</p>
        <p>Status: {tracker.status}</p>
        <p>All Paid: {tracker.stats.allPaid ? '✅ Yes' : '❌ No'}</p>
      </div>
    </div>
  );
}
