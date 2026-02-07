'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, Loader, AlertCircle } from 'lucide-react';

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  paymentStatus: string;
  deliveryType: string;
  createdAt: string;
  estimatedDelivery?: string;
  vendor: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    rating?: number;
  };
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
  };
  statusHistory: Array<{
    id: string;
    status: string;
    message: string;
    createdAt: string;
    createdBy: string;
  }>;
  deliveryPartner?: {
    id: string;
    name: string;
  };
  items?: Array<any>;
}

export default function GuestOrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/guest-orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to find order');
      }

      const orderData = await response.json();
      setOrder(orderData);
      setIsVerified(true);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve order');
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'out_for_delivery':
        return <Truck className="w-8 h-8 text-blue-500" />;
      case 'ready':
      case 'preparing':
        return <Package className="w-8 h-8 text-yellow-500" />;
      default:
        return <Package className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-700';
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return 'bg-yellow-100 text-yellow-700';
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusFlow = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStatusIndex = (status: string) => {
    return statusFlow.findIndex(s => s.key === status);
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 py-12 pt-32">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>

          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-pink-100 rounded-full p-4 mb-4">
                <Package className="w-8 h-8 text-pink-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
              <p className="text-gray-600">Enter your email to view order status and tracking details</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-orange-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'View Order Details'
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> You can share this tracking link with others. They'll need to enter your email to view the order status.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 py-12 pt-32">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto text-pink-600 mb-4" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gray-50 py-12 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => setIsVerified(false)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Track Another Order
        </button>

        <div className="grid gap-8">
          {/* Order Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order {order.orderNumber}</h1>
                <p className="text-gray-600 mb-4">Placed on {formatDate(order.createdAt)}</p>
                <div className="flex gap-4">
                  <div className="bg-pink-50 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-600 mb-1">Order Total</p>
                    <p className="text-2xl font-bold text-pink-600">₹{order.finalAmount.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                    <p className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <p className={`text-lg font-bold capitalize ${getStatusColors(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-pink-200">
                  <p className="text-xs text-gray-600 mb-1">Vendor</p>
                  <p className="font-semibold text-gray-900">{order.vendor.name}</p>
                  {order.deliveryPartner && (
                    <p className="text-sm text-blue-600 mt-2 font-medium">
                      🚚 Delivered by: {order.deliveryPartner.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Timeline</h2>

            {/* Status Progress Bar */}
            <div className="mb-8">
              <div className="flex gap-2 mb-4">
                {statusFlow.map((status, index) => (
                  <div key={status.key} className="flex-1">
                    <button
                      className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                        index <= getStatusIndex(order.status)
                          ? 'bg-gradient-to-r from-pink-600 to-orange-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                      title={status.label}
                    >
                      {status.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            <div className="space-y-4">
              {order.statusHistory.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No status updates yet</p>
              ) : (
                order.statusHistory.map((update, idx) => (
                  <div key={update.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-pink-600 mt-2"></div>
                      {idx !== order.statusHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-pink-200 my-2"></div>
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <p className="font-semibold text-gray-900 capitalize">
                        {update.status.replace(/_/g, ' ')}
                      </p>
                      <p className="text-gray-600 text-sm">{update.message || 'Order status updated'}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(update.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-600 mb-1">Customer Name</p>
                <p className="font-semibold text-gray-900">{order.user.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Email Address</p>
                <p className="font-semibold text-gray-900">{order.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                <p className="font-semibold text-gray-900">{order.user.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Delivery Type</p>
                <p className="font-semibold text-gray-900 capitalize">{order.deliveryType}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-orange-500 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
