'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, MapPin, Phone, Mail, Package, Clock, DollarSign, Truck, Home, Store, Users, Calendar } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
}

interface Contributor {
  email: string;
  amount: number;
  status: string;
}

interface DeliveryAddress {
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  address?: string;
  fullAddress?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface VendorProfile {
  businessName?: string;
  shopPhone?: string;
  shopEmail?: string;
  shopAddress?: string;
  ownerName?: string;
  ownerPhone?: string;
}

interface OrderItem {
  name: string;
  price?: number;
  quantity?: number;
  customization?: Record<string, string>;
}

interface StatusHistoryItem {
  status: string;
  message?: string;
  createdAt: string;
}

interface DeliveryPartner {
  name: string;
  phone?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  vendor: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    logo?: string;
    rating?: number;
    profile?: VendorProfile;
  };
  deliveryAddress?: DeliveryAddress | string;
  deliveryPincode?: string;
  totalAmount?: number;
  deliveryFee?: number;
  discount?: number;
  finalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  estimatedDelivery?: string;
  statusHistory?: StatusHistoryItem[];
  deliveryPartner?: DeliveryPartner;
  coPayment?: {
    contributors: Contributor[];
  };
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
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrderDetails = useCallback(async () => {
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
    } catch (err: Error | unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load order details';
      setError(errorMsg);
      console.error('Order fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId, fetchOrderDetails]);

  const getDeliveryAddressData = (address: DeliveryAddress | string | undefined): DeliveryAddress => {
    if (typeof address === 'string') return {};
    return address || {};
  };

  if (!isOpen) return null;

  const deliveryAddr = order ? getDeliveryAddressData(order.deliveryAddress) : {};
  const vendorProfile = order?.vendor?.profile || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-pink-600 via-pink-500 to-orange-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Order Details</h2>
            <p className="text-sm text-white/80 mt-1">Order #{order?.orderNumber || 'Loading...'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Close order details"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading && (
          <div className="mt-15 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-pink-600 border-t-orange-500 rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading order details...</p>
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
          <div className="p-6 space-y-6">
            {/* Order Status & Date */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-600" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`px-6 py-2 rounded-full text-lg font-bold ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                {order.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Vendor & Items */}
              <div className="space-y-6">
                {/* Vendor/Seller Card */}
                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
                      {order.vendor.logo ? (
                        <Image src={order.vendor.logo} alt={order.vendor.name} width={56} height={56} className="w-full h-full object-cover rounded" />
                      ) : (
                        <Store className="w-7 h-7 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{order.vendor.name || vendorProfile.businessName}</h3>
                      {order.vendor.rating && (
                        <p className="text-sm text-gray-600">⭐ {order.vendor.rating.toFixed(1)} rating</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t border-blue-200 pt-4">
                    {(order.vendor.phone || vendorProfile.shopPhone) && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-sm text-gray-700">{order.vendor.phone || vendorProfile.shopPhone}</span>
                      </div>
                    )}
                    {(order.vendor.email || vendorProfile.shopEmail) && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-sm text-gray-700">{order.vendor.email || vendorProfile.shopEmail}</span>
                      </div>
                    )}
                    {(order.vendor.address || vendorProfile.shopAddress) && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                        <span className="text-sm text-gray-700">{order.vendor.address || vendorProfile.shopAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-pink-600" />
                    Items Ordered
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                    {Array.isArray(order.items) && order.items.map((item: OrderItem, idx: number) => (
                      <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name || 'Item'}</p>
                          {item.customization && (
                            <p className="text-xs text-gray-600 mt-1">
                              {typeof item.customization === 'string'
                                ? item.customization
                                : Object.entries(item.customization || {}).map(([key, val]) => `${key}: ${val}`).join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">Qty: <span className="font-semibold">{item.quantity || 1}</span></p>
                        </div>
                        <p className="font-bold text-gray-900 ml-4">₹{item.price?.toFixed(0) || '0'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Split Payment Info if applicable */}
                {order.coPayment?.contributors && order.coPayment.contributors.length > 0 && (
                  <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Split Payment
                    </h4>
                    <div className="space-y-2">
                      {order.coPayment.contributors.map((payer: Contributor, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="text-gray-900 font-medium">{payer.email}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                              payer.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {payer.status?.toUpperCase()}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">₹{payer.amount?.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Delivery & Payment */}
              <div className="space-y-6">
                {/* Delivery Address */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Home className="w-5 h-5 text-pink-600" />
                    Delivery Address
                  </h3>
                  <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 space-y-3">
                    {/* Recipient Info */}
                    {(deliveryAddr.recipientName || deliveryAddr.recipientPhone) && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Recipient</p>
                        {deliveryAddr.recipientName && (
                          <p className="font-bold text-gray-900">{deliveryAddr.recipientName}</p>
                        )}
                        {deliveryAddr.recipientPhone && (
                          <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3" /> {deliveryAddr.recipientPhone}
                          </p>
                        )}
                        {deliveryAddr.recipientEmail && (
                          <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3" /> {deliveryAddr.recipientEmail}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Location Info */}
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">Location</p>
                      {deliveryAddr.fullAddress || deliveryAddr.address ? (
                        <p className="text-sm text-gray-900 font-medium mb-2">{deliveryAddr.fullAddress || deliveryAddr.address}</p>
                      ) : null}
                      {deliveryAddr.landmark && (
                        <p className="text-sm text-gray-700 mb-2">📍 Landmark: {deliveryAddr.landmark}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                        {deliveryAddr.city && (
                          <div>
                            <p className="text-xs text-gray-600">City</p>
                            <p className="font-semibold text-gray-900">{deliveryAddr.city}</p>
                          </div>
                        )}
                        {deliveryAddr.state && (
                          <div>
                            <p className="text-xs text-gray-600">State</p>
                            <p className="font-semibold text-gray-900">{deliveryAddr.state}</p>
                          </div>
                        )}
                        {(order.deliveryPincode || deliveryAddr.pincode) && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-600">Pincode</p>
                            <p className="font-semibold text-gray-900">{order.deliveryPincode || deliveryAddr.pincode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-pink-600" />
                    Payment Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-semibold text-gray-900">₹{order.totalAmount?.toFixed(0) || '0'}</span>
                    </div>
                    {order.deliveryFee && order.deliveryFee > 0 && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-gray-700">Delivery Fee</span>
                        <span className="font-semibold text-gray-900">₹{order.deliveryFee.toFixed(0)}</span>
                      </div>
                    )}
                    {order.discount && order.discount > 0 && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200 text-green-600">
                        <span className="font-semibold">Discount Applied</span>
                        <span className="font-semibold">-₹{order.discount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 bg-linear-to-r from-pink-600 to-orange-500 text-white px-4 py-2 rounded-lg -mx-4">
                      <span className="font-bold">Total Amount</span>
                      <span className="text-2xl font-bold">₹{order.finalAmount?.toFixed(0) || '0'}</span>
                    </div>
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-semibold text-gray-900">{order.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Payment Status</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                          order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 
                          order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.paymentStatus?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Delivery */}
                {order.estimatedDelivery && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">Est. Delivery</p>
                    <p className="font-bold text-gray-900">
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
            </div>

            {/* Order Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-pink-600" />
                  Order Timeline
                </h3>
                <div className="space-y-3">
                  {order.statusHistory.map((history: StatusHistoryItem, idx: number) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className="relative">
                        <div className="absolute -left-3 top-2 w-3 h-3 bg-pink-600 rounded-full border-2 border-white"></div>
                        {idx !== order.statusHistory!.length - 1 && (
                          <div className="absolute -left-1.5 top-6 w-1 h-8 bg-pink-200"></div>
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="font-semibold text-gray-900 capitalize">{history.status?.replace(/_/g, ' ')}</p>
                        {history.message && (
                          <p className="text-sm text-gray-600 mt-1">{history.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
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
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-pink-600" />
                  Delivery Partner
                </h3>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 space-y-3">
                  <p className="font-semibold text-gray-900">{order.deliveryPartner.name}</p>
                  {order.deliveryPartner.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700">{order.deliveryPartner.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
