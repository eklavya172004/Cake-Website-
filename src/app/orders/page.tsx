'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Package, Clock, MapPin, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  finalAmount: number;
  notes?: string | null;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  deliveryAddress: {
    city: string;
  };
  vendor: {
    name: string;
  };
  createdAt: string;
  estimatedDelivery: string;
}

interface SplitPaymentData {
  coPayers: Array<{
    email: string;
    amount: number;
    status: 'pending' | 'paid';
  }>;
}

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Preparing' },
  ready: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Ready' },
  picked_up: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Picked Up' },
  out_for_delivery: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Out for Delivery' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
};

const getSplitPaymentData = (order: Order): SplitPaymentData | null => {
  if (!order.notes) return null;
  try {
    const notes = JSON.parse(order.notes);
    return notes.splitPaymentLinks ? { coPayers: notes.splitPaymentLinks } : null;
  } catch (e) {
    return null;
  }
};

const calculatePaymentStatus = (data: SplitPaymentData) => {
  const paidAmount = data.coPayers
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = data.coPayers
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalAmount = data.coPayers.reduce((sum, p) => sum + p.amount, 0);
  const paidCount = data.coPayers.filter(p => p.status === 'paid').length;
  
  return {
    paidAmount,
    pendingAmount,
    totalAmount,
    paidCount,
    totalCount: data.coPayers.length,
  };
};

export default function OrdersHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch orders from API
        const response = await fetch('/api/user/orders');
        if (response.ok) {
          const data = await response.json();
          const apiOrders = data.orders || [];
          setOrders(apiOrders);
          console.log('Orders loaded from API:', apiOrders);
        } else if (response.status === 401) {
          // Not authenticated - load from localStorage
          console.log('Not authenticated, loading from localStorage');
          const storedOrders = localStorage.getItem('userOrders');
          console.log('Stored orders from localStorage:', storedOrders);
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders);
            setOrders(parsedOrders);
            console.log('Parsed and set orders:', parsedOrders);
          } else {
            console.log('No orders found in localStorage');
            setOrders([]);
          }
        } else {
          // Other error - fallback to localStorage
          console.log('API returned status:', response.status, 'falling back to localStorage');
          const storedOrders = localStorage.getItem('userOrders');
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders);
            setOrders(parsedOrders);
            console.log('Fallback orders from localStorage:', parsedOrders);
          } else {
            setOrders([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        // Fallback to localStorage
        const storedOrders = localStorage.getItem('userOrders');
        console.log('Exception caught, loading from localStorage:', storedOrders);
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          setOrders(parsedOrders);
        } else {
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 pt-24">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-900">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 text-gray-900 pt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-6 transition-colors font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage all your cake orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl p-4 mb-8 border border-gray-200 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'preparing', label: 'Preparing' },
              { value: 'out_for_delivery', label: 'Delivering' },
              { value: 'delivered', label: 'Delivered' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  filter === tab.value
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:border-pink-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'You haven\'t placed any orders yet. Start shopping for delicious cakes!'
                : `No orders found with status "${filter}".`}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const statusColor = getStatusColor(order.status);
              const splitPaymentData = order.paymentMethod === 'split' ? getSplitPaymentData(order) : null;
              const paymentStatus = splitPaymentData ? calculatePaymentStatus(splitPaymentData) : null;
              
              return (
                <button
                  key={order.id}
                  onClick={() => {
                    if (order.paymentMethod === 'split') {
                      router.push(`/split-payment-status/${order.id}`);
                    } else {
                      router.push(`/orders/${order.id}`);
                    }
                  }}
                  className="w-full text-left bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-pink-300 transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-xl">
                          🎂
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">{order.vendor.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} •{' '}
                        {order.items.map(item => item.name).join(', ')}
                      </p>
                    </div>

                    {/* Status and Details */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
                      {/* Status Badge */}
                      <div>
                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
                          {statusColor.label}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-pink-600" />
                          <div>
                            <p className="text-xs text-gray-600">Placed</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-pink-600" />
                          <div>
                            <p className="text-xs text-gray-600">Delivery</p>
                            <p className="font-semibold text-gray-900">{order.deliveryAddress.city}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Amount</p>
                          <p className="font-bold text-pink-600">₹{order.finalAmount}</p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>

                  {/* Split Payment Status Section */}
                  {order.paymentMethod === 'split' && paymentStatus && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
                        Split Payment Status
                      </h4>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-900">
                            {paymentStatus.paidCount} of {paymentStatus.totalCount} Paid
                          </span>
                          <span className="text-xs font-semibold text-pink-600">
                            {Math.round((paymentStatus.paidCount / paymentStatus.totalCount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-pink-700 h-full rounded-full transition-all"
                            style={{
                              width: `${(paymentStatus.paidCount / paymentStatus.totalCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Payment Amounts */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                          <p className="text-green-700 font-semibold">Paid</p>
                          <p className="text-green-900 font-bold">₹{paymentStatus.paidAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                          <p className="text-amber-700 font-semibold">Pending</p>
                          <p className="text-amber-900 font-bold">₹{paymentStatus.pendingAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Co-payers List */}
                      <div className="mt-4 space-y-2">
                        {splitPaymentData?.coPayers.map((payer, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <p className="text-gray-700 truncate">{payer.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">₹{payer.amount.toFixed(2)}</span>
                              <span
                                className={`px-2 py-0.5 rounded-lg text-white text-[10px] font-bold ${
                                  payer.status === 'paid'
                                    ? 'bg-green-600'
                                    : 'bg-amber-600'
                                }`}
                              >
                                {payer.status === 'paid' ? '✓ Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-8 border border-pink-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help With Your Orders?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Track Status</h3>
              </div>
              <p className="text-gray-600 text-sm">Click on any order to see real-time tracking updates and order progress</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Contact Support</h3>
              </div>
              <p className="text-gray-600 text-sm">Need assistance? Reach out to our support team for any questions or concerns</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Reorder</h3>
              </div>
              <p className="text-gray-600 text-sm">Order your favorite cakes again from order history with just one click</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
