'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Truck, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  finalAmount: number;
  createdAt: string;
  deliveryAddress: Record<string, any>;
  deliveryPincode: string;
  items: Array<{
    cakeId: string;
    name: string;
    quantity: number;
    customization?: string;
    price: number;
  }>;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  vendor: {
    id: string;
    name: string;
  };
  deliveryPartner?: {
    id: string;
    name: string;
  };
  notes?: string;
  vendorNotes?: string;
  coPayment?: {
    id: string;
    amount: number;
    dueDate: string;
    status: string;
  };
  statusHistory: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

const statusConfig = {
  delivered: { bg: 'bg-green-50', text: 'text-green-700', icon: '✓' },
  delivering: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🚚' },
  preparing: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🔨' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '⏳' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: '✕' },
  confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '✓' },
  ready: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: '📦' },
};

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Order not found');
          }
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-4"
        >
          <ArrowLeft size={20} /> Back to Orders
        </button>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">
          Loading order details...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-4"
        >
          <ArrowLeft size={20} /> Back to Orders
        </button>
        <div className="bg-red-50 rounded-xl shadow-sm p-6 text-red-600 border border-red-200">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
      >
        <ArrowLeft size={20} /> Back to Orders
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-gray-600 mt-2">Order details and customer information</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    {item.customization && typeof item.customization === 'object' && (
                      <div className="text-sm text-gray-600 mt-1">
                        {Object.entries(item.customization).map(([key, value]) => (
                          <p key={key}>{key}: {String(value)}</p>
                        ))}
                      </div>
                    )}
                    {item.customization && typeof item.customization === 'string' && (
                      <p className="text-sm text-gray-600 mt-1">{item.customization}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-pink-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <p>Subtotal</p>
                <p>₹{(order.totalAmount - order.deliveryFee + order.discount).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <p>Delivery Fee</p>
                <p>₹{order.deliveryFee.toFixed(2)}</p>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <p>Discount</p>
                  <p>-₹{order.discount.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-gray-900">Final Amount</p>
                <p className="text-2xl font-bold text-pink-600">₹{order.finalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-gray-400 mt-1"><Mail size={20} /></div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{order.user.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-gray-400 mt-1"><Mail size={20} /></div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{order.user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-gray-400 mt-1"><Phone size={20} /></div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{order.user.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin size={24} /> Delivery Address
            </h2>
            <div className="space-y-2">
              <p className="text-gray-900 text-lg">{order.deliveryAddress?.address || 'Address not available'}</p>
              <p className="text-gray-600">{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryPincode}</p>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Customer Notes</p>
                <p className="text-gray-900 mt-1">{order.notes}</p>
              </div>
            )}
            {order.vendorNotes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 font-medium">Vendor Notes</p>
                <p className="text-gray-900 mt-1">{order.vendorNotes}</p>
              </div>
            )}
          </div>

          {/* Split Payments */}
          {order.coPayment && (
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">Installment Payment</p>
                      <p className="text-sm text-gray-600">Due: {new Date(order.coPayment.dueDate).toLocaleDateString('en-IN')}</p>
                      <p className="text-sm text-gray-600 mt-1 capitalize">{order.coPayment.status}</p>
                    </div>
                    <p className="text-lg font-bold text-pink-600">₹{order.coPayment.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Vendor</h3>
            <p className="font-semibold text-gray-900">{order.vendor.name}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={18} />
                <span className="text-sm">{orderDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck size={18} />
                <span className="text-sm capitalize">{order.status}</span>
              </div>
              {order.deliveryPartner && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck size={18} />
                  <span className="text-sm">Partner: {order.deliveryPartner.name}</span>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Final Amount</p>
                <p className="text-2xl font-bold text-pink-600">₹{order.finalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
