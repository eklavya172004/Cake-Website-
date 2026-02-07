'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, RotateCcw, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  vendorName: string;
  amount: number;
  status: string;
  date: string;
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [deleting, setDeleting] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const orderId = order.orderNumber || order.id || '';
    const matchesSearch = orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (order.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleStatusChange = async (orderId: string, orderNumber: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setEditingOrderId(null);
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
      console.error('Status change error:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(orderId);
      const response = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete order');

      setOrders(orders.filter(o => o.id !== orderId));
      toast.success('Order deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete order');
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleRefund = async (orderId: string) => {
    if (confirm('Are you sure you want to refund this order?')) {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
          method: 'POST',
        });
        if (response.ok) {
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'refunded' } : o));
          toast.success('Refund processed');
        }
      } catch (err) {
        toast.error('Failed to process refund');
        console.error('Refund error:', err);
      }
    }
  };

  const handleDispute = (orderId: string) => {
    router.push(`/admin/disputes?orderId=${orderId}`);
  };

  const statusConfig = {
    delivered: { bg: 'bg-green-50', text: 'text-green-700' },
    delivering: { bg: 'bg-blue-50', text: 'text-blue-700' },
    preparing: { bg: 'bg-purple-50', text: 'text-purple-700' },
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700' },
    ready: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    picked_up: { bg: 'bg-orange-50', text: 'text-orange-700' },
    out_for_delivery: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2 text-lg">Monitor all platform orders and track performance</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">Loading orders...</div>
      ) : error ? (
        <div className="bg-red-50 rounded-xl shadow-sm p-6 text-red-600 border border-red-200">Error: {error}</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-pink-600 group">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-green-600 group">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Delivered</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{orders.filter(o => o.status === 'delivered').length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-blue-600 group">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{orders.filter(o => ['delivering', 'preparing', 'out_for_delivery'].includes(o.status)).length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-purple-600 group">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">₹{(orders.reduce((sum, o) => sum + o.amount, 0) / 1000).toFixed(1)}K</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="preparing">Preparing</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                    return (
                      <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{order.orderNumber || order.id}</td>
                        <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                        <td className="px-6 py-4 text-gray-600">{order.vendorName}</td>
                        <td className="px-6 py-4 font-semibold text-pink-600">₹{order.amount}</td>
                        <td className="px-6 py-4 text-gray-600">{order.date}</td>
                        <td className="px-6 py-4">
                          {editingOrderId === order.id ? (
                            <select
                              value={selectedStatus}
                              onChange={(e) => setSelectedStatus(e.target.value)}
                              onBlur={() => {
                                if (selectedStatus) {
                                  handleStatusChange(order.id, order.orderNumber || order.id, selectedStatus);
                                }
                              }}
                              autoFocus
                              className="px-3 py-1 border border-pink-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                              <option value="">Select Status</option>
                              {ORDER_STATUSES.map(s => (
                                <option key={s} value={s}>
                                  {s.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                              {order.status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewDetails(order.orderNumber || order.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingOrderId(order.id);
                                setSelectedStatus(order.status);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                              title="Change Status"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order.id, order.orderNumber || order.id)}
                              disabled={deleting === order.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" 
                              title="Delete Order"
                            >
                              <Trash2 size={18} />
                            </button>
                            {order.status === 'cancelled' && (
                              <button 
                                onClick={() => handleDispute(order.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                                title="Handle Dispute"
                              >
                                <AlertCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
