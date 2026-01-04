'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Package, Truck, Clock, MapPin, Phone, Mail, Home } from 'lucide-react';
import OrderPreloader from '@/components/common/OrderPreloader';

interface OrderStatusHistory {
  id: string;
  status: string;
  message: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  deliveryFee: number;
  estimatedDelivery: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    landmark?: string;
  };
  vendor: {
    name: string;
  };
  statusHistory: OrderStatusHistory[];
  createdAt: string;
}

const statusSteps = [
  { status: 'pending', label: 'Order Placed', icon: '📦' },
  { status: 'confirmed', label: 'Confirmed', icon: '✅' },
  { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { status: 'ready', label: 'Ready for Pickup', icon: '📋' },
  { status: 'picked_up', label: 'Picked Up', icon: '🚗' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { status: 'delivered', label: 'Delivered', icon: '🎉' },
];

const statusColors: { [key: string]: { bg: string; text: string; dot: string } } = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  ready: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  picked_up: { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500' },
  out_for_delivery: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    
    fetchOrder();
    setLoading(false);

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.status === status);
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  if (loading) {
    return (
      <>
        <OrderPreloader onComplete={() => setLoading(false)} />
        <div className="min-h-screen bg-[#FFF9EB] p-4 pt-24">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1a1a1a] border-t-[#F7E47D]"></div>
            <p className="mt-4 text-[#1a1a1a]">Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen mt-15 bg-[#FFF9EB] p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1a1a1a] hover:text-[#F7E47D] mb-8 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="bg-white rounded-lg p-8 text-center border border-[#1a1a1a]/10">
            <p className="text-xl text-[#1a1a1a] mb-4">Order not found</p>
            <button
              onClick={() => router.push('/profile')}
              className="bg-[#1a1a1a] text-[#F7E47D] px-6 py-2 rounded font-semibold hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-15 bg-[#FFF9EB] py-8 px-4 text-[#1a1a1a]">
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
          <div className="flex justify-between items-start gap-6">
            <div>
              <h1 className="serif text-4xl mb-2">Order Tracking</h1>
              <p className="text-[#1a1a1a]/60">Order #{order.orderNumber}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-[#1a1a1a] text-[#F7E47D] px-4 py-2 rounded font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Timeline/Status */}
        <div className="bg-white rounded-lg p-8 mb-8 border border-[#1a1a1a]/10">
          <h2 className="serif text-3xl mb-8">Order Status</h2>

          {/* Status Timeline */}
          <div className="relative">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="mb-8 last:mb-0">
                <div className="flex gap-6">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index <= (order ? getStatusIndex(order.status) : -1)
                          ? 'bg-[#F7E47D] text-[#1a1a1a] shadow-lg'
                          : 'bg-[#1a1a1a]/10 text-[#1a1a1a]/50'
                      }`}
                    >
                      {index <= (order ? getStatusIndex(order.status) : -1) ? '✓' : index + 1}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-1 h-16 mt-2 ${
                          index < (order ? getStatusIndex(order.status) : -1) ? 'bg-[#F7E47D]' : 'bg-[#1a1a1a]/10'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className={`text-lg font-bold ${index <= (order ? getStatusIndex(order.status) : -1) ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/50'}`}>
                      {step.label}
                    </h3>
                    {index === (order ? getStatusIndex(order.status) : -1) && (
                      <p className="text-[#F7E47D] font-semibold mt-1">Currently here</p>
                    )}
                    {order.statusHistory && (
                      <>
                        {order.statusHistory
                          .filter(h => h.status === step.status)
                          .map(h => (
                            <p key={h.id} className="text-[#1a1a1a]/70 text-sm mt-2">{h.message}</p>
                          ))}
                        {order.statusHistory
                          .filter(h => h.status === step.status)
                          .map(h => (
                            <p key={`${h.id}-time`} className="text-[#1a1a1a]/50 text-xs mt-1">
                              {new Date(h.createdAt).toLocaleString()}
                            </p>
                          ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Items */}
          <div className="bg-white rounded-lg p-6 border border-[#1a1a1a]/10">
            <h3 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F7E47D]" />
              Items Ordered
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="text-sm pb-3 border-b border-[#1a1a1a]/10 last:border-0 last:pb-0">
                  <p className="font-semibold text-[#1a1a1a]">{item.name}</p>
                  <p className="text-[#1a1a1a]/70">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Info */}
          <div className="bg-white rounded-lg p-6 border border-[#1a1a1a]/10">
            <h3 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F7E47D]" />
              Preparing at
            </h3>
            <p className="text-lg font-semibold text-[#1a1a1a] mb-2">{order.vendor.name}</p>
            <p className="text-sm text-[#1a1a1a]/70">
              Estimated delivery:{' '}
              {new Date(order.estimatedDelivery).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Total */}
          <div className="bg-[#F7E47D]/20 rounded-lg p-6 border border-[#F7E47D]">
            <h3 className="font-bold text-[#1a1a1a] mb-4">Order Total</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#1a1a1a]/70">Subtotal</span>
                <span className="font-semibold text-[#1a1a1a]">₹{(order.finalAmount - order.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#F7E47D] pt-3">
                <span className="text-[#1a1a1a]/70">Delivery</span>
                <span className="font-semibold text-[#1a1a1a]">₹{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-[#F7E47D] pt-3">
                <span className="text-[#1a1a1a]">Total</span>
                <span className="text-[#1a1a1a] bg-[#F7E47D] px-3 py-1 rounded">₹{order.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg p-8 mb-8 border border-[#1a1a1a]/10">
          <h3 className="serif text-3xl mb-6 flex items-center gap-2">
            <Home className="w-6 h-6 text-[#F7E47D]" />
            Delivery Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-[#1a1a1a]/60 mb-1">Name</p>
              <p className="font-semibold text-[#1a1a1a]">{order.deliveryAddress.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-[#1a1a1a]/60 mb-1">Phone</p>
              <p className="font-semibold text-[#1a1a1a] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F7E47D]" />
                {order.deliveryAddress.phone}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-[#1a1a1a]/60 mb-1">Address</p>
              <p className="font-semibold text-[#1a1a1a]">
                {order.deliveryAddress.address}
                {order.deliveryAddress.landmark && `, ${order.deliveryAddress.landmark}`}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-[#1a1a1a]/60 mb-1">Email</p>
              <p className="font-semibold text-[#1a1a1a] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F7E47D]" />
                {order.deliveryAddress.email}
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-[#1a1a1a] rounded-lg p-8 text-[#F7E47D] text-center border border-[#F7E47D]">
          <h3 className="serif text-2xl font-bold mb-2">Need Help?</h3>
          <p className="mb-4 text-[#F7E47D]/80">Contact our support team for any queries</p>
          <button className="bg-[#F7E47D] text-[#1a1a1a] px-6 py-2 rounded font-semibold hover:shadow-lg transition-all">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
