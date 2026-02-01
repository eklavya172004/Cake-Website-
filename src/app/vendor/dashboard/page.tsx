'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, ShoppingCart, Star, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardData {
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  rating: number;
  completionRate: number;
  pendingOrders: number;
}

export default function VendorDashboard() {
  const router = useRouter();
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
          <p className="text-gray-600 mt-1">Loading your dashboard...</p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="text-gray-500 mt-4">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your vendor dashboard</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900">Complete Your Profile</h3>
              <p className="text-blue-800 mt-2">
                To see your dashboard and start selling cakes, you need to complete your vendor onboarding first. 
                This is a quick process where you'll provide your business information, owner details, and service areas.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => router.push('/vendor/onboarding')}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  <CheckCircle size={18} />
                  Go to Onboarding
                </button>
                <button
                  onClick={() => router.push('/vendor/profile')}
                  className="px-6 py-2 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  View My Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your vendor dashboard</p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-yellow-900">No Dashboard Data Available</h3>
              <p className="text-yellow-800 mt-2">
                It looks like your onboarding might not be complete. Visit your profile or complete the onboarding process to start using your dashboard.
              </p>
              <button
                onClick={() => router.push('/vendor/onboarding')}
                className="mt-4 px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
              >
                Complete Onboarding
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Today\'s Orders',
      value: data.todayOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Today\'s Revenue',
      value: `₹${data.todayRevenue || 0}`,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${data.totalRevenue || 0}`,
      icon: TrendingUp,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      title: 'Rating',
      value: `${data.rating?.toFixed(1) || 0}⭐`,
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
                  {data.completionRate || 0}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${data.completionRate || 0}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} /> Pending Orders
          </h2>
          <p className="text-3xl font-bold text-pink-600">{data.pendingOrders || 0}</p>
          <p className="text-gray-600 text-sm mt-2">Orders waiting to be prepared</p>
        </div>
      </div>
    </div>
  );
}
