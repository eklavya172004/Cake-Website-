'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Mail, Package, Clock, DollarSign, Truck, Home } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

const statusColors: { [key: string]: { bg: string; text: string } } = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-800' },
  ready: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  picked_up: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  out_for_delivery: { bg: 'bg-blue-100', text: 'text-blue-800' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
};

export default function OrderDetailModal({ isOpen, orderId, onClose }: OrderDetailModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching order details for ID:', orderId);
      const response = await fetch(`/api/orders/${orderId}`);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch order details');
      }

      const data = await response.json();
      console.log('Order data received:', data);
      setOrder(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load order details';
      setError(errorMsg);
      console.error('Order fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Order Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading && (
          <div className="mt-15 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#1a1a1a] border-t-[#F7E47D] rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          </div>
        )}

        {order && (
          <div className="p-6 space-y-8">
            {/* Order Header */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="text-2xl font-bold text-[#1a1a1a]">{order.orderNumber}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="font-semibold text-[#1a1a1a]">{item.name || 'Item'}</p>
                      {item.customization && (
                        <p className="text-sm text-gray-600">
                          {typeof item.customization === 'string'
                            ? item.customization
                            : Object.keys(item.customization).length > 0
                            ? JSON.stringify(item.customization)
                            : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1a1a1a]">₹{item.price?.toFixed(2) || '0'}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a1a1a]">Vendor Information</h3>
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    {order.vendor.logo ? (
                      <img src={order.vendor.logo} alt={order.vendor.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <span className="text-2xl">🏪</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">{order.vendor.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      {order.vendor.rating && (
                        <span>⭐ {order.vendor.rating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 border-t border-blue-200 pt-3">
                  {order.vendor.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{order.vendor.phone}</span>
                    </div>
                  )}
                  {order.vendor.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{order.vendor.email}</span>
                    </div>
                  )}
                  {order.vendor.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        {typeof order.vendor.address === 'string'
                          ? order.vendor.address
                          : JSON.stringify(order.vendor.address)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
                <Home className="w-5 h-5" />
                Delivery Address
              </h3>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {typeof order.deliveryAddress === 'string'
                    ? order.deliveryAddress
                    : order.deliveryAddress?.fullAddress ||
                      order.deliveryAddress?.address ||
                      JSON.stringify(order.deliveryAddress, null, 2)}
                </p>
                {order.deliveryPincode && (
                  <p className="text-sm text-gray-600 mt-3 font-semibold">Pincode: {order.deliveryPincode}</p>
                )}
              </div>
            </div>

            {/* Pricing Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-[#1a1a1a]">₹{order.totalAmount?.toFixed(2) || '0'}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Delivery Fee</span>
                    <span className="font-semibold text-[#1a1a1a]">₹{order.deliveryFee?.toFixed(2) || '0'}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Discount</span>
                    <span className="font-semibold text-green-600">-₹{order.discount?.toFixed(2) || '0'}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 bg-white -m-4 p-4 rounded">
                  <span className="font-bold text-[#1a1a1a]">Total Amount</span>
                  <span className="text-xl font-bold text-[#F7E47D] bg-[#1a1a1a] px-4 py-1 rounded">₹{order.finalAmount?.toFixed(2) || '0'}</span>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    Payment Method: <span className="font-semibold text-[#1a1a1a]">{order.paymentMethod || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment Status: <span className={`font-semibold ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order Timeline
                </h3>
                <div className="space-y-2">
                  {order.statusHistory.map((history: any, idx: number) => (
                    <div key={idx} className="flex gap-4 border-l-2 border-[#F7E47D] pl-4">
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-3 h-3 bg-[#F7E47D] rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-[#1a1a1a] capitalize">{history.status?.replace(/_/g, ' ')}</p>
                        {history.message && (
                          <p className="text-sm text-gray-600">{history.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(history.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Partner Info */}
            {order.deliveryPartner && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Partner
                </h3>
                <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                  <p className="font-semibold text-[#1a1a1a]">{order.deliveryPartner.name}</p>
                  {order.deliveryPartner.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{order.deliveryPartner.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                <p className="font-semibold text-[#1a1a1a]">
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
