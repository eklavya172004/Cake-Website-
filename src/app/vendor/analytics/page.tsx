'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
  ordersTrend: Array<{ date: string; orders: number }>;
  ratingTrend: Array<{ date: string; rating: number }>;
  categoryPerformance: Array<{ name: string; orders: number; revenue: number }>;
}

export default function VendorAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/vendor/analytics', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Your shop performance metrics</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend (30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.revenueTrend || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} name="Revenue (₹)" dot={{ fill: '#ec4899', r: 4 }} />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} name="Orders" dot={{ fill: '#3b82f6', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Orders Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.ordersTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="orders" fill="#3b82f6" name="Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Category Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.categoryPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="orders" fill="#ec4899" name="Orders" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#f59e0b" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
