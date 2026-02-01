'use client';

import { useEffect, useState } from 'react';
import { Eye, Check, X, Clock, Loader, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  cakeName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  itemsCount: number;
  items: OrderItem[];
  deliveryAddress: any;
  deliveryDate: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-indigo-100 text-indigo-800',
  delivering: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_SEQUENCE = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/vendor/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < STATUS_SEQUENCE.length - 1) {
      return STATUS_SEQUENCE[currentIndex + 1];
    }
    return null;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');
      const updatedOrder = await response.json();
      
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      setExpandedOrder(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage your shop orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden">
              {/* Order Summary Row */}
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${STATUS_COLORS[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-600">
                            <span>{item.cakeName} × {item.quantity}</span>
                            <span>₹{item.price}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">No items</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Delivery Date</p>
                      <p className="font-semibold text-gray-900">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-gray-900 truncate">{order.email}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Delivery Address</p>
                      <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                        {typeof order.deliveryAddress === 'string' 
                          ? order.deliveryAddress 
                          : `${order.deliveryAddress.street}, ${order.deliveryAddress.city} ${order.deliveryAddress.zipCode}`}
                      </p>
                    </div>
                  )}

                  {/* Status Update Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-3">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_SEQUENCE.slice(STATUS_SEQUENCE.indexOf(order.status) + 1).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(order.id, status)}
                          disabled={updatingOrderId === order.id}
                          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          {updatingOrderId === order.id ? (
                            <Loader size={16} className="animate-spin" />
                          ) : null}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                      {STATUS_SEQUENCE.indexOf(order.status) === STATUS_SEQUENCE.length - 1 && (
                        <span className="text-sm text-gray-600 py-2">Order completed</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
