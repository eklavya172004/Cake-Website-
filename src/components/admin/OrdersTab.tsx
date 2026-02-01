'use client';

import { useEffect, useState } from 'react';
import {
  Edit,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface OrderItem {
  cakeId: string;
  name: string;
  quantity: number;
  customization?: any;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  finalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  createdAt: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  notes?: string;
  vendorNotes?: string;
}

interface OrdersTabProps {
  vendorId: string;
}

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export default function OrdersTab({ vendorId }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await fetch(
        `/api/admin/vendors/${vendorId}/orders?page=${page}&limit=10${statusParam}`
      );
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchOrders();
    }
  }, [vendorId, page, statusFilter]);

  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setEditingStatus(order.status);
    setEditingNotes(order.vendorNotes || '');
  };

  const handleSaveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: editingStatus,
          notes: editingNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      // Update local state
      setOrders(
        orders.map((o) =>
          o.id === orderId
            ? { ...o, status: editingStatus, vendorNotes: editingNotes }
            : o
        )
      );

      setEditingOrderId(null);
      alert('Order updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      picked_up: 'bg-cyan-100 text-cyan-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          All Orders
        </button>
        {['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100" 
                   onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Customer: {order.user.name} • {order.user.phone}</p>
                      <p>Amount: ₹{order.finalAmount.toFixed(2)} • Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {expandedOrder === order.id ? (
                      <ChevronUp size={24} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={24} className="text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="px-6 py-4 border-t border-gray-200 space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item: OrderItem, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="bg-gray-50 rounded p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">₹{(order.totalAmount).toFixed(2)}</span>
                    </div>
                    {order.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="text-gray-900">₹{order.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-red-600">-₹{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{order.finalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Edit Status Section */}
                  {editingOrderId === order.id ? (
                    <div className="bg-blue-50 rounded p-4 space-y-4 border border-blue-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update Status
                        </label>
                        <select
                          value={editingStatus}
                          onChange={(e) => setEditingStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vendor Notes
                        </label>
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Add any internal notes..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveOrder(order.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingOrderId(null)}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                      >
                        <Edit size={18} />
                        Edit Order
                      </button>
                    </div>
                  )}

                  {/* Customer Notes */}
                  {order.notes && (
                    <div className="bg-yellow-50 rounded p-4 border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-900">Customer Notes</p>
                      <p className="text-yellow-800 text-sm mt-1">{order.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
