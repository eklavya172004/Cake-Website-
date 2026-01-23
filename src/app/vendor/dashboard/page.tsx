'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingCart, Star, Clock } from 'lucide-react';

interface DashboardData {
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  rating: number;
  completionRate: number;
  pendingOrders: number;
}

export default function VendorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/vendor/dashboard', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const stats = [
    {
      title: 'Today\'s Orders',
      value: data?.todayOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Today\'s Revenue',
      value: `₹${data?.todayRevenue || 0}`,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${data?.totalRevenue || 0}`,
      icon: TrendingUp,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      title: 'Rating',
      value: `${data?.rating?.toFixed(1) || 0}⭐`,
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your shop performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Completion Rate</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  {data?.completionRate || 0}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${data?.completionRate || 0}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} /> Pending Orders
          </h2>
          <p className="text-3xl font-bold text-pink-600">{data?.pendingOrders || 0}</p>
          <p className="text-gray-600 text-sm mt-2">Orders waiting to be prepared</p>
        </div>
      </div>
    </div>
  );
}
