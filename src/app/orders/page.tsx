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
      <div className= "min-h-screen mt-15 bg-[#FFF9EB] p-4 pt-24">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1a1a1a] border-t-[#F7E47D]"></div>
          <p className="mt-4 text-[#1a1a1a]">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-15 bg-[#FFF9EB] py-12 px-4 text-[#1a1a1a]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className=" mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1a1a1a] hover:text-[#F7E47D] mb-6 transition-colors font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="serif text-4xl mb-2">My Orders</h1>
          <p className="text-[#1a1a1a]/70">Track and manage all your cake orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg p-4 mb-8 border border-[#1a1a1a]/10">
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
                className={`px-4 py-2 rounded font-semibold transition-all whitespace-nowrap ${
                  filter === tab.value
                    ? 'bg-[#1a1a1a] text-[#F7E47D] shadow-lg'
                    : 'bg-[#FFF9EB] text-[#1a1a1a] border border-[#1a1a1a]/10 hover:border-[#F7E47D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-[#1a1a1a]/10">
            <Package className="w-16 h-16 text-[#1a1a1a]/20 mx-auto mb-4" />
            <h2 className="serif text-2xl mb-2">No orders yet</h2>
            <p className="text-[#1a1a1a]/70 mb-6">
              {filter === 'all'
                ? 'You haven\'t placed any orders yet. Start shopping for delicious cakes!'
                : `No orders found with status "${filter}".`}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#1a1a1a] text-[#F7E47D] px-6 py-3 rounded font-semibold hover:shadow-lg transition-all"
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
                  className="w-full text-left bg-white rounded-lg border border-[#1a1a1a]/10 p-6 hover:shadow-lg hover:border-[#F7E47D] transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-[#F7E47D]/20 rounded flex items-center justify-center text-xl">
                          🎂
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1a1a1a]">{order.orderNumber}</h3>
                          <p className="text-sm text-[#1a1a1a]/70">{order.vendor.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#1a1a1a]/70">
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
                          <Clock className="w-4 h-4 text-[#F7E47D]" />
                          <div>
                            <p className="text-xs text-[#1a1a1a]/60">Placed</p>
                            <p className="font-semibold text-[#1a1a1a]">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#F7E47D]" />
                          <div>
                            <p className="text-xs text-[#1a1a1a]/60">Delivery</p>
                            <p className="font-semibold text-[#1a1a1a]">{order.deliveryAddress.city}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#1a1a1a]/60">Amount</p>
                          <p className="font-bold text-[#F7E47D]">₹{order.finalAmount}</p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-[#1a1a1a]/40 group-hover:text-[#F7E47D] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>

                  {/* Split Payment Status Section */}
                  {order.paymentMethod === 'split' && paymentStatus && (
                    <div className="mt-6 pt-6 border-t border-[#1a1a1a]/10">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/60 mb-3">
                        Split Payment Status
                      </h4>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-[#1a1a1a]">
                            {paymentStatus.paidCount} of {paymentStatus.totalCount} Paid
                          </span>
                          <span className="text-xs font-semibold text-[#F7E47D]">
                            {Math.round((paymentStatus.paidCount / paymentStatus.totalCount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#F7E47D] to-[#d946a6] h-full rounded-full transition-all"
                            style={{
                              width: `${(paymentStatus.paidCount / paymentStatus.totalCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Payment Amounts */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-green-600 font-semibold">Paid</p>
                          <p className="text-green-800 font-bold">₹{paymentStatus.paidAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-orange-50 rounded p-2">
                          <p className="text-orange-600 font-semibold">Pending</p>
                          <p className="text-orange-800 font-bold">₹{paymentStatus.pendingAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Co-payers List */}
                      <div className="mt-4 space-y-2">
                        {splitPaymentData?.coPayers.map((payer, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <p className="text-[#1a1a1a]/70 truncate">{payer.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#1a1a1a]">₹{payer.amount.toFixed(2)}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-white text-[10px] font-bold ${
                                  payer.status === 'paid'
                                    ? 'bg-green-600'
                                    : 'bg-orange-600'
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
        <div className="mt-12 bg-[#1a1a1a] rounded-lg p-8 border border-[#F7E47D]">
          <h2 className="serif text-2xl text-[#F7E47D] mb-6">Need Help With Your Orders?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-[#F7E47D] mb-2">Track Status</h3>
              <p className="text-[#F7E47D]/70 text-sm">Click on any order to see real-time tracking updates</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#F7E47D] mb-2">Contact Support</h3>
              <p className="text-[#F7E47D]/70 text-sm">Need assistance? Reach out to our support team</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#F7E47D] mb-2">Reorder</h3>
              <p className="text-[#F7E47D]/70 text-sm">Order your favorite cakes again from order history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
