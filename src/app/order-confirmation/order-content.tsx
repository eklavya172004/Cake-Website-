'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

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
  };
  vendor: {
    name: string;
  };
}

export function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="mb-6">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-600 mb-8">We couldn't find the order you're looking for. Please check your order ID and try again.</p>
          </div>
          <Link
            href="/cakes"
            className="inline-block bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 pt-32">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-xl opacity-90">Thank you for your order. Your delicious cakes are being prepared.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Order Number</p>
                  <p className="text-2xl font-bold text-gray-900">{order.orderNumber || orderId}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Status</p>
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold capitalize">
                    {order.status || 'Confirmed'}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{order.finalAmount - (order.deliveryFee || 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>₹{order.deliveryFee || 0}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-pink-600">₹{order.finalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Timeline</h2>
              <div className="space-y-6">
                {[
                  { icon: CheckCircle, title: 'Order Confirmed', description: 'Your order has been placed successfully' },
                  { icon: Package, title: 'Being Prepared', description: 'Our bakery is preparing your delicious cakes' },
                  { icon: Truck, title: 'Out for Delivery', description: 'Your order is on its way to you' },
                  { icon: MapPin, title: 'Delivered', description: `Expected by ${order.estimatedDelivery}` }
                ].map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <StepIcon className="w-6 h-6" />
                        </div>
                        {index < 3 && <div className="w-1 h-12 bg-gray-200 mt-2"></div>}
                      </div>
                      <div className="pt-2 pb-8">
                        <h4 className={`font-bold mb-1 ${index === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                          {step.title}
                        </h4>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                    <p className="text-gray-600 text-sm mt-1">{order.deliveryAddress.address}</p>
                    <p className="text-gray-600 text-sm">{order.deliveryAddress.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-pink-600" />
                  <p className="text-gray-900 font-medium">{order.deliveryAddress.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-pink-600" />
                  <p className="text-gray-900 font-medium break-all">{order.deliveryAddress.email}</p>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Vendor</h3>
              <p className="text-gray-900 font-medium mb-4">{order.vendor.name}</p>
            </div>

            {/* Continue Shopping Button */}
            <Link
              href="/cakes"
              className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white font-bold py-4 rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Continue Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
