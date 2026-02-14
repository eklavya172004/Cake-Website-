'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Package, Truck, Clock, MapPin, Phone, Mail, Home, AlertCircle } from 'lucide-react';
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
    state?: string;
    landmark?: string;
  };
  deliveryPincode: string;
  vendor: {
    id: string;
    name: string;
    profile?: {
      shopPhone?: string;
      shopEmail?: string;
      shopAddress?: string;
    };
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
        <div className="min-h-screen mt-20 bg-white p-4 pt-32">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-700 font-semibold">Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen mt-20 bg-white p-4 pt-32">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-pink-600 mb-8 transition-colors font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-xl text-gray-900 mb-4 font-semibold">Order not found</p>
            <button
              onClick={() => router.push('/profile')}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-700 transition-all shadow-sm hover:shadow-md"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-white py-8 px-4 text-gray-900">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-pink-600 mb-6 transition-colors font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Tracking</h1>
              <p className="text-gray-600 font-medium">Order #{order.orderNumber}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Timeline/Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Order Status</h2>

          {/* Status Timeline */}
          <div className="relative">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="mb-8 last:mb-0">
                <div className="flex gap-6">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        index <= (order ? getStatusIndex(order.status) : -1)
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index <= (order ? getStatusIndex(order.status) : -1) ? '✓' : index + 1}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-1 h-16 mt-2 transition-colors duration-300 ${
                          index < (order ? getStatusIndex(order.status) : -1) ? 'bg-pink-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className={`text-lg font-bold transition-colors ${index <= (order ? getStatusIndex(order.status) : -1) ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </h3>
                    {index === (order ? getStatusIndex(order.status) : -1) && (
                      <p className="text-pink-600 font-semibold mt-1">Currently here</p>
                    )}
                    {order.statusHistory && (
                      <>
                        {order.statusHistory
                          .filter(h => h.status === step.status)
                          .map(h => (
                            <p key={h.id} className="text-gray-600 text-sm mt-2">{h.message}</p>
                          ))}
                        {order.statusHistory
                          .filter(h => h.status === step.status)
                          .map(h => (
                            <p key={`${h.id}-time`} className="text-gray-500 text-xs mt-1">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-600" />
              Items Ordered
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="text-sm pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Split Payment Info */}
          {(order as any).coPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                👥 Split Payment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-blue-700 font-medium mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-900">₹{(order as any).coPayment.totalAmount?.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-medium mb-1">Co-payers</p>
                  <p className="text-2xl font-bold text-blue-900">{(order as any).coPayment.contributors?.length || 0}</p>
                </div>
              </div>
              
              {/* Contributors */}
              {(order as any).coPayment.contributors && (order as any).coPayment.contributors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-900">Payment Status:</p>
                  {(order as any).coPayment.contributors.map((contributor: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                      <span className="text-sm text-gray-700">{contributor.email}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">₹{contributor.amount?.toFixed(0)}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          contributor.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {contributor.status === 'paid' ? '✓ Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vendor Info - Preparing at */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
            <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
              <div className="bg-purple-600 text-white rounded-full p-2">
                <Package className="w-4 h-4" />
              </div>
              Preparing At
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Shop Name</p>
                <p className="text-xl font-bold text-gray-900">{order.vendor.name}</p>
              </div>
              
              {order.vendor.profile?.shopAddress && (
                <div className="pt-3 border-t border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1 flex items-center gap-2">
                    📍 Shop Address
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{order.vendor.profile.shopAddress}</p>
                </div>
              )}
              
              <div className="pt-3 border-t border-purple-200 space-y-3">
                {order.vendor.profile?.shopPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide\">Contact</p>
                      <p className="text-sm font-semibold text-gray-900">{order.vendor.profile.shopPhone}</p>
                    </div>
                  </div>
                )}
                
                {order.vendor.profile?.shopEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide\">Email</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{order.vendor.profile.shopEmail}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-purple-200">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estimated Delivery
                </p>
                <p className="text-lg font-bold text-purple-900">
                  {new Date(order.estimatedDelivery).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {new Date(order.estimatedDelivery).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl shadow-sm border border-pink-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Order Total</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">₹{(order.finalAmount - order.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-pink-200 pt-3">
                <span className="text-gray-600">Delivery</span>
                <span className="font-semibold text-gray-900">₹{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-pink-200 pt-3">
                <span className="text-gray-900">Total</span>
                <span className="text-white bg-pink-600 px-3 py-1 rounded-lg">₹{order.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address - Refactored */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="bg-pink-100 text-pink-600 rounded-full p-2.5">
              <MapPin className="w-6 h-6" />
            </div>
            Delivery Address
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recipient Details Card */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recipient</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">{order.deliveryAddress.fullName}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <Phone className="w-5 h-5 text-pink-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">{order.deliveryAddress.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{order.deliveryAddress.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Details Card */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Delivery Location
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Address</p>
                  <p className="text-base font-semibold text-gray-900 leading-relaxed">
                    {order.deliveryAddress.address}
                  </p>
                </div>
                
                {order.deliveryAddress.landmark && (
                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Landmark</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                      📍 {order.deliveryAddress.landmark}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
                  <div className="bg-white px-3 py-2 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">City</p>
                    <p className="text-sm font-semibold text-gray-900">{order.deliveryAddress.city}</p>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">State</p>
                    <p className="text-sm font-semibold text-gray-900">{order.deliveryAddress.state || '-'}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-blue-200 bg-white px-3 py-2 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">📮 Pincode</p>
                  <p className="text-base font-bold text-gray-900">{order.deliveryPincode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl shadow-md p-8 text-white text-center border border-pink-500">
          <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Need Help?
          </h3>
          <p className="mb-6 text-pink-100 font-medium">Contact our support team for any queries</p>
          <button className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
