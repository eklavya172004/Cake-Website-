'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

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

export default function OrderConfirmationPage() {
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
        const response = await fetch(`/api/orders?id=${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order && orderId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Order not found</p>
            <Link href="/">
              <button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Banner */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600">
            Thank you for your order. Your delicious cake is being prepared.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* Order Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <h2 className="text-2xl font-bold text-gray-900">{order?.orderNumber || orderNumber}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Order Status</p>
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                  Pending Confirmation
                </span>
              </div>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Order placed just now
            </p>
          </div>

          {/* Items Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order?.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-pink-600">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Vendor Info */}
            <div className="p-4 bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-600" />
                Preparing at
              </h4>
              <p className="text-lg font-semibold text-gray-900">{order?.vendor.name}</p>
              <p className="text-sm text-gray-600 mt-2">Estimated time: ~2-3 hours</p>
            </div>

            {/* Delivery Info */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Delivering to
              </h4>
              {order?.deliveryAddress && (
                <>
                  <p className="font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {order.deliveryAddress.address}, {order.deliveryAddress.city}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6 mb-6">
            <h4 className="font-bold text-gray-900 mb-4">Delivery Address Details</h4>
            {order?.deliveryAddress && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-pink-600" />
                  <span>{order.deliveryAddress.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-pink-600" />
                  <span>{order.deliveryAddress.email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">₹{order ? (order.finalAmount - order.deliveryFee) : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Delivery Fee</span>
                <span className="font-semibold">₹{order?.deliveryFee}</span>
              </div>
              {order && order.finalAmount && (
                <>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900">Total Amount</span>
                      <span className="font-bold text-pink-600">₹{order.finalAmount}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-pink-600 text-white">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Vendor Confirmation</h4>
                <p className="text-gray-600 text-sm">The vendor will confirm your order shortly</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-pink-600 text-white">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Cake Preparation</h4>
                <p className="text-gray-600 text-sm">Your cake will be prepared with fresh ingredients</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-pink-600 text-white">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Quality Check</h4>
                <p className="text-gray-600 text-sm">Your cake will be carefully packed and checked</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-pink-600 text-white">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Delivery</h4>
                <p className="text-gray-600 text-sm">Fresh cake delivered to your doorstep</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/orders/${orderId || 'tracking'}`}>
            <button className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
              Track Your Order
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/">
            <button className="w-full bg-white border-2 border-pink-500 text-pink-600 px-8 py-4 rounded-lg font-semibold hover:bg-pink-50 transition-all">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
