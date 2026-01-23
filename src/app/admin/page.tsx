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

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your platform overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-pink-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">₹{(dashboardData.totalRevenue / 100000).toFixed(1)}L</p>
              <p className="text-green-600 text-sm mt-2">↑ 12.5% from last month</p>
            </div>
            <TrendingUp className="w-12 h-12 text-pink-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.totalOrders}</p>
              <p className="text-green-600 text-sm mt-2">↑ 8.2% from last month</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.activeVendors}</p>
              <p className="text-blue-600 text-sm mt-2">Platform vendors</p>
            </div>
            <Users className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Open Disputes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.disputes}</p>
              <p className="text-red-600 text-sm mt-2">Needs attention</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Vendors</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Orders</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.map((vendor, idx) => (
                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{vendor.name}</td>
                  <td className="px-6 py-3 text-gray-600">{vendor.orders}</td>
                  <td className="px-6 py-3 text-gray-600">₹{(vendor.revenue / 1000).toFixed(0)}K</td>
                  <td className="px-6 py-3 text-gray-600">₹{(vendor.revenue / vendor.orders).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
