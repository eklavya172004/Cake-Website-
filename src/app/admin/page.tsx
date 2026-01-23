'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Users, AlertCircle } from 'lucide-react';

interface OrdersByStatus {
  [key: string]: number;
}

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  activeVendors: number;
  disputes: number;
  ordersByStatus: OrdersByStatus;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!dashboardData) return <div className="p-6 text-red-600">No data available</div>;

  const revenueData = [
    { date: 'Jan 1', revenue: 12000, orders: 45 },
    { date: 'Jan 2', revenue: 15000, orders: 52 },
    { date: 'Jan 3', revenue: 18000, orders: 61 },
    { date: 'Jan 4', revenue: 22000, orders: 75 },
    { date: 'Jan 5', revenue: 25000, orders: 88 },
    { date: 'Jan 6', revenue: dashboardData.totalRevenue, orders: dashboardData.totalOrders },
  ];

  const orderStatusData = Object.entries(dashboardData.ordersByStatus).map(([status, count], index) => {
    const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
    return {
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count as number,
      fill: colors[index % colors.length],
    };
  });

  const topVendors = [
    { name: 'Sweet Dreams Bakery', orders: 250, revenue: 125000 },
    { name: 'Sugar Rush', orders: 180, revenue: 95000 },
    { name: 'Cake Paradise', orders: 150, revenue: 78000 },
    { name: 'The Cake House', orders: 120, revenue: 65000 },
  ];

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here&apos;s your platform overview</p>
      </div>

      {/* KPI Cards - Bakingo Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border-l-4 border-pink-600 hover:border-pink-700 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{(dashboardData.totalRevenue / 100000).toFixed(1)}L</p>
              <p className="text-green-600 text-sm mt-3 font-semibold">↑ 12.5% from last month</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border-l-4 border-blue-600 hover:border-blue-700 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.totalOrders}</p>
              <p className="text-green-600 text-sm mt-3 font-semibold">↑ 8.2% from last month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border-l-4 border-purple-600 hover:border-purple-700 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Active Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.activeVendors}</p>
              <p className="text-blue-600 text-sm mt-3 font-semibold">Platform vendors</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border-l-4 border-red-600 hover:border-red-700 group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Open Disputes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.disputes}</p>
              <p className="text-red-600 text-sm mt-3 font-semibold">Needs attention</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} name="Revenue (₹)" dot={{ fill: '#ec4899', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Vendors</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.map((vendor, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{vendor.name}</td>
                  <td className="px-6 py-4 text-gray-600">{vendor.orders}</td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">₹{(vendor.revenue / 1000).toFixed(0)}K</td>
                  <td className="px-6 py-4 text-gray-600">₹{(vendor.revenue / vendor.orders).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
