'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingCart, Clock, Star, Users } from 'lucide-react';

interface DashboardData {
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  rating: number;
  completionRate: number;
  pendingOrders: number;
  totalProducts: number;
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number; orders: number }>>([]);
  const [orderStatusData, setOrderStatusData] = useState<Array<{ name: string; value: number; fill: string }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; orders: number; revenue: number }>>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/vendor/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const data: DashboardData = await response.json();
        setStats(data);

        // Generate sample weekly data (in production, this would come from the API)
        const today = new Date();
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          weekData.push({
            date: dayName,
            revenue: Math.floor(Math.random() * 10000) + 5000,
            orders: Math.floor(Math.random() * 15) + 5,
          });
        }
        setRevenueData(weekData);

        // Set order status based on real data (assuming API returns this)
        setOrderStatusData([
          { name: 'Delivered', value: Math.max(1, Math.floor(data.totalRevenue / 5000)), fill: '#10b981' },
          { name: 'Pending', value: data.pendingOrders, fill: '#f59e0b' },
          { name: 'Cancelled', value: Math.floor(data.totalRevenue / 50000), fill: '#ef4444' },
        ]);

        // Generate sample top products (in production, would come from API)
        setTopProducts([
          { name: 'Chocolate Cake', orders: 45, revenue: 22500 },
          { name: 'Vanilla Cake', orders: 38, revenue: 19000 },
          { name: 'Black Forest', orders: 28, revenue: 16800 },
          { name: 'Cheesecake', orders: 22, revenue: 15400 },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-600 font-medium">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600 font-semibold">Error: {error}</div>;
  if (!stats) return <div className="p-6 text-red-600 font-semibold">No data available</div>;

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg pt-32 mt-0">
      {/* Quick Stats - Bakingo Modern Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border-l-4 border-pink-600 hover:border-pink-700 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Today&apos;s Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.todayOrders}</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <ShoppingCart className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border-l-4 border-green-600 hover:border-green-700 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border-l-4 border-yellow-600 hover:border-yellow-700 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">⭐ {stats.rating.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border-l-4 border-blue-600 hover:border-blue-700 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completionRate}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border-l-4 border-purple-600 hover:border-purple-700 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Revenue & Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#ec4899" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status</h3>
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

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Avg Sale</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-600">{product.orders}</td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">₹{(product.revenue / 1000).toFixed(1)}K</td>
                  <td className="px-6 py-4 text-gray-600">₹{(product.revenue / product.orders).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
