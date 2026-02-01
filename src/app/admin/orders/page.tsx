'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, RotateCcw, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
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
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleRefund = async (orderId: string) => {
    if (confirm('Are you sure you want to refund this order?')) {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
          method: 'POST',
        });
        if (response.ok) {
          // Refresh orders list
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'refunded' } : o));
        }
      } catch (err) {
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
              <p className="text-3xl font-bold text-blue-600 mt-2">{orders.filter(o => ['delivering', 'preparing'].includes(o.status)).length}</p>
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
              <option value="delivering">Delivering</option>
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
                        <td className="px-6 py-4 font-semibold text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                        <td className="px-6 py-4 text-gray-600">{order.vendorName}</td>
                        <td className="px-6 py-4 font-semibold text-pink-600">₹{order.amount}</td>
                        <td className="px-6 py-4 text-gray-600">{order.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewDetails(order.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {order.status === 'cancelled' && (
                              <button 
                                onClick={() => handleRefund(order.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Refund Order"
                              >
                                <RotateCcw size={18} />
                              </button>
                            )}
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
