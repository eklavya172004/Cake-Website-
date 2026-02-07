'use client';

import { useEffect, useState } from 'react';
import { Eye, Check, X, Clock, Loader, ChevronDown, ChevronUp, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  cakeName: string;
  quantity: number;
  price: number;
  customization?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  totalAmount: number;
  deliveryFee: number;
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
  const [editingDeliveryFee, setEditingDeliveryFee] = useState<Record<string, number>>({});
  const [savingDeliveryFee, setSavingDeliveryFee] = useState<string | null>(null);

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
      toast.success('Order status updated successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(errorMsg);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeliveryFeeChange = (orderId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingDeliveryFee(prev => ({
      ...prev,
      [orderId]: numValue,
    }));
  };

  const handleSaveDeliveryFee = async (orderId: string) => {
    setSavingDeliveryFee(orderId);
    try {
      const newDeliveryFee = editingDeliveryFee[orderId];
      if (newDeliveryFee === undefined) {
        toast.error('Please enter a delivery fee');
        return;
      }

      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryFee: newDeliveryFee }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update delivery fee');
      }

      const updatedOrder = await response.json();
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      setEditingDeliveryFee(prev => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
      toast.success('Delivery fee updated successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save delivery fee';
      toast.error(errorMsg);
    } finally {
      setSavingDeliveryFee(null);
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
                    <div className="space-y-3">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-semibold text-gray-900">{item.cakeName} × {item.quantity}</span>
                              <span className="font-semibold text-gray-900">₹{item.price}</span>
                            </div>
                            {item.customization && (
                              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                                <p className="font-semibold text-blue-900 mb-1">Customization:</p>
                                <div className="text-gray-700 space-y-1">
                                  {typeof item.customization === 'string' ? (
                                    <p>{item.customization}</p>
                                  ) : typeof item.customization === 'object' ? (
                                    Object.entries(item.customization).map(([key, value]) => (
                                      <p key={key}>
                                        <span className="font-medium capitalize">{key}:</span> {String(value)}
                                      </p>
                                    ))
                                  ) : null}
                                </div>
                              </div>
                            )}
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

                  {/* Delivery Fee Editor */}
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Delivery Fee</p>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingDeliveryFee[order.id] ?? order.deliveryFee}
                          onChange={(e) => handleDeliveryFeeChange(order.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveDeliveryFee(order.id)}
                        disabled={savingDeliveryFee === order.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 h-10"
                      >
                        {savingDeliveryFee === order.id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Delivery Address</p>
                      <div className="bg-white p-3 rounded border border-gray-200 space-y-2">
                        {typeof order.deliveryAddress === 'string' ? (
                          <p className="text-sm text-gray-700">{order.deliveryAddress}</p>
                        ) : (
                          <>
                            {order.deliveryAddress.fullName && (
                              <p className="text-sm font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                            )}
                            {order.deliveryAddress.address && (
                              <p className="text-sm text-gray-700">{order.deliveryAddress.address}</p>
                            )}
                            <div className="flex flex-col gap-1">
                              {order.deliveryAddress.city && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">City:</span> {order.deliveryAddress.city}
                                </p>
                              )}
                              {order.deliveryAddress.phone && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Phone:</span> {order.deliveryAddress.phone}
                                </p>
                              )}
                              {order.deliveryAddress.landmark && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Landmark:</span> {order.deliveryAddress.landmark}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
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
