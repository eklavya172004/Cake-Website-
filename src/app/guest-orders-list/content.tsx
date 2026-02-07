'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Package, Truck, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  estimatedDelivery?: string;
  vendor: {
    id: string;
    name: string;
    logo?: string;
  };
  user: {
    email: string;
    name: string;
  };
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  pending: {
    icon: <Clock className="w-5 h-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  confirmed: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  preparing: {
    icon: <Package className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  ready: {
    icon: <Package className="w-5 h-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  picked_up: {
    icon: <Truck className="w-5 h-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  out_for_delivery: {
    icon: <Truck className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  delivered: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  cancelled: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
};

export default function GuestOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!email) {
      router.push('/track-orders');
      return;
    }

    fetchOrders();
  }, [email, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guest-orders-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const uniqueStatuses = ['all', ...new Set(orders.map(o => o.status))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1);
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-50 py-12 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <button
          onClick={() => router.push('/track-orders')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Track Options
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Tracking orders for <strong className="text-gray-900">{email}</strong></p>
          <button
            onClick={() => router.push('/track-orders')}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium mt-2"
          >
            Change email
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Error Loading Orders</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => router.push('/track-orders')}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  ← Try Again
                </button>
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">We couldn't find any orders associated with this email address.</p>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Make sure you're using the correct email address.</p>
              <button
                onClick={() => router.push('/track-orders')}
                className="inline-block bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Try Another Email
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="mb-8 flex flex-wrap gap-2">
              {uniqueStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-pink-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : getStatusLabel(status)}
                  {status === 'all' ? ` (${orders.length})` : ` (${orders.filter(o => o.status === status).length})`}
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

                return (
                  <button
                    key={order.id}
                    onClick={() => router.push(`/guest-orders/${order.id}`)}
                    className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-pink-300 transition-all p-6 text-left group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                      {/* Order Number & Vendor */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Order ID</p>
                        <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600 mt-2">{order.vendor.name}</p>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Order Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                        {order.estimatedDelivery && (
                          <p className="text-xs text-gray-600 mt-2">
                            Delivery by {formatDate(order.estimatedDelivery)}
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Status</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgColor} ${statusConfig.color} font-semibold text-sm`}>
                          {statusConfig.icon}
                          {getStatusLabel(order.status)}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-pink-600">₹{order.finalAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 text-pink-600 font-semibold group-hover:gap-4 transition-all justify-end">
                          View Details <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Empty State Message */}
            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No orders with this status</p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to track individual orders with more details?
          </p>
          <p className="text-sm text-gray-500">
            Click on any order above to see full tracking information, delivery address, and status history.
          </p>
        </div>
      </div>
    </div>
  );
}
