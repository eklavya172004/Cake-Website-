'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, Clock, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CoPayerStatus {
  email: string;
  amount: number;
  status: 'pending' | 'paid';
  paymentLinkId?: string;
}

interface SplitPaymentStatus {
  coPayers: CoPayerStatus[];
  status: 'pending' | 'completed';
}

export default function SplitPaymentStatus({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<{
    totalAmount: number;
    orderStatus: string;
    splitPayment: SplitPaymentStatus;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchPaymentStatus = async (checkRazorpay = false) => {
    try {
      const res = await fetch(
        `/api/payment-status?orderId=${orderId}${checkRazorpay ? '&checkRazorpay=true' : ''}`
      );
      const data = await res.json();

      console.log('API Response:', data); // Debug log
      console.log('Co-Payers:', data.splitPayment?.coPayers); // Debug log

      if (data.success) {
        setPaymentData({
          totalAmount: data.totalAmount,
          orderStatus: data.orderStatus,
          splitPayment: data.splitPayment,
        });
      } else {
        setError(data.error || 'Failed to fetch payment status');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error fetching payment status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [orderId]);

  // Auto-refresh every 10 seconds if payment is still pending
  useEffect(() => {
    if (!autoRefresh || !paymentData || paymentData.splitPayment.status === 'completed') {
      return;
    }

    // Auto-refresh from database only, don't check Razorpay on auto-refresh
    const interval = setInterval(() => fetchPaymentStatus(false), 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, paymentData]);

  if (loading) {
    return (
      <div className="min-h-screen mt-15 bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin inline-block">
            <RefreshCw className="text-pink-600" size={40} />
          </div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen mt-15 bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded flex gap-3 items-start">
            <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Link href="/orders" className="mt-4 inline-block text-pink-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const { totalAmount, splitPayment } = paymentData;
  const coPayers = splitPayment?.coPayers || [];
  const paidAmount = coPayers
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = totalAmount - paidAmount;
  const paidCount = coPayers.filter(p => p.status === 'paid').length;
  const totalCount = coPayers.length;
  const isCompleted = splitPayment?.status === 'completed';

  return (
    <div className="min-h-screen mt-15 bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Profile</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="text-pink-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Split Payment Status</h1>
          </div>
          <p className="text-gray-600">Order ID: {orderId}</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 ${
          isCompleted 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400' 
            : 'bg-white border-2 border-pink-200'
        }`}>
          <div className="flex items-center gap-4 mb-6">
            {isCompleted ? (
              <>
                <CheckCircle className="text-green-600" size={40} />
                <div>
                  <h2 className="text-2xl font-bold text-green-600">Payment Complete!</h2>
                  <p className="text-green-700">All payments have been received</p>
                </div>
              </>
            ) : (
              <>
                <Clock className="text-orange-600 animate-spin" size={40} />
                <div>
                  <h2 className="text-2xl font-bold text-orange-600">Payment Pending</h2>
                  <p className="text-orange-700">Waiting for all co-payers to complete payment</p>
                </div>
              </>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Payment Progress</span>
              <span className="text-sm font-semibold text-pink-600">{paidCount} of {totalCount} paid</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-500"
                style={{ width: `${(paidCount / totalCount) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₹{paidAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-600">Received</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">₹{pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">₹{totalAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Co-Payers List */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users size={24} className="text-pink-600" />
            Co-Payers Details ({splitPayment.coPayers?.length || 0})
          </h3>

          {(!splitPayment.coPayers || splitPayment.coPayers.length === 0) ? (
            <div className="p-4 text-gray-600 text-center">
              <p>No co-payers data available</p>
              <p className="text-sm text-gray-500 mt-2">Payment data may still be loading...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coPayers.map((payer, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 transition-all ${
                  payer.status === 'paid'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-orange-50 border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        {payer.status === 'paid' ? (
                          <CheckCircle className="text-green-600" size={24} />
                        ) : (
                          <Clock className="text-orange-600" size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{payer.email}</p>
                        <p className="text-sm text-gray-600">Amount: ₹{payer.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                      payer.status === 'paid'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-orange-200 text-orange-800'
                    }`}>
                      {payer.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <button
            onClick={() => fetchPaymentStatus(true)}
            className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh Status
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-pink-600 text-pink-600 py-3 rounded-lg font-semibold hover:bg-pink-50 transition cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            Auto-Refresh (10s)
          </label>
          <Link
            href="/orders"
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
          >
            Back to Orders
          </Link>
        </div>

        {/* Info Message */}
        {!isCompleted && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
            <p className="font-semibold mb-2">ℹ️ How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Payment links have been sent to all co-payers via email</li>
              <li>This page automatically refreshes every 10 seconds</li>
              <li>Once all payments are received, your order will be confirmed</li>
              <li>You can manually refresh or toggle auto-refresh anytime</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
