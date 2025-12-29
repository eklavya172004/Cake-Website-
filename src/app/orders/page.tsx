'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Package, Clock, MapPin, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
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

export default function OrdersHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // For now, load from localStorage (mock data from past sessions)
        const storedOrders = localStorage.getItem('userOrders');
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
        // In production, fetch from /api/orders/user or /api/user/orders
      } catch (error) {
        console.error('Failed to fetch orders:', error);
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
      <div className="min-h-screen bg-[#FFF9EB] p-4 pt-24">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1a1a1a] border-t-[#F7E47D]"></div>
          <p className="mt-4 text-[#1a1a1a]">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9EB] py-12 px-4 text-[#1a1a1a]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
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
              return (
                <button
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
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
