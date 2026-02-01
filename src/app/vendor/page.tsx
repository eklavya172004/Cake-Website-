'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingCart, Clock, Star, Users, AlertCircle, CheckCircle, Trash2, Edit2, Plus } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  rating: number;
  completionRate: number;
  pendingOrders: number;
  totalProducts: number;
  onboardingStatus?: string;
  approvalStatus?: string;
}

interface Cake {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  images: string[];
  isActive: boolean;
  flavors: string[];
  customOptions?: {
    toppings: string[];
  };
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number; orders: number }>>([]);
  const [orderStatusData, setOrderStatusData] = useState<Array<{ name: string; value: number; fill: string }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; orders: number; revenue: number }>>([]);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/vendor/dashboard', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const data: DashboardData = await response.json();
        setStats(data);

        // Fetch actual weekly revenue data from API
        try {
          const weeklyResponse = await fetch('/api/vendor/analytics/weekly-revenue', { credentials: 'include' });
          if (weeklyResponse.ok) {
            const weeklyData = await weeklyResponse.json();
            setRevenueData(weeklyData.weeklyData || []);
          } else {
            setRevenueData([]);
          }
        } catch (err) {
          console.error('Error fetching weekly revenue:', err);
          setRevenueData([]);
        }

        // Fetch actual order status data from API
        try {
          const statusResponse = await fetch('/api/vendor/analytics/order-status', { credentials: 'include' });
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setOrderStatusData(statusData.statusData || []);
          } else {
            setOrderStatusData([]);
          }
        } catch (err) {
          console.error('Error fetching order status:', err);
          setOrderStatusData([]);
        }

        // Fetch actual top products for this vendor
        try {
          const productsResponse = await fetch('/api/vendor/products/top', { credentials: 'include' });
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            setTopProducts(productsData);
          } else {
            // Fallback to empty products
            setTopProducts([]);
          }
        } catch (err) {
          console.error('Error fetching top products:', err);
          setTopProducts([]);
        }

        // Fetch cakes for this vendor
        try {
          const cakesResponse = await fetch('/api/vendor/cakes', { credentials: 'include' });
          if (cakesResponse.ok) {
            const cakesData = await cakesResponse.json();
            setCakes(cakesData || []);
          } else {
            setCakes([]);
          }
        } catch (err) {
          console.error('Error fetching cakes:', err);
          setCakes([]);
        }
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

  const needsOnboarding = stats.onboardingStatus !== 'completed' && stats.approvalStatus === 'pending';
  const isApproved = stats.approvalStatus === 'approved';
  const isRejected = stats.approvalStatus === 'rejected';

  const handleDeleteCake = async (cakeId: string) => {
    if (!window.confirm('Are you sure you want to delete this cake? This action cannot be undone.')) {
      return;
    }

    setDeletingId(cakeId);
    try {
      const response = await fetch(`/api/vendor/cakes/${cakeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCakes(cakes.filter((cake) => cake.id !== cakeId));
      } else {
        const data = await response.json();
        alert('Error deleting cake: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error deleting cake: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 bg-linear-to-br from-gray-50 to-white p-6 rounded-lg pt-32 mt-0">
      {/* Onboarding Status Alert */}
      {needsOnboarding && (
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Complete Your Onboarding</h3>
            <p className="text-sm text-blue-700 mt-1">
              Fill out your business details to start selling. Your information will be reviewed by our team.
            </p>
            <Link href="/vendor/onboarding">
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                Continue Onboarding
              </button>
            </Link>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Onboarding Approved! 🎉</h3>
            <p className="text-sm text-green-700 mt-1">
              Your profile has been approved. You can now start adding products and taking orders.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Onboarding Rejected</h3>
            <p className="text-sm text-red-700 mt-1">
              Your onboarding was not approved. Please contact support for more details.
            </p>
          </div>
        </div>
      )}
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
              <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
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

      {/* Your Cakes Section */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Your Cakes Catalog</h3>
          <Link href="/vendor/cakes/upload">
            <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition">
              <Plus size={18} /> Add New Cake
            </button>
          </Link>
        </div>

        {cakes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No cakes added yet</p>
            <p className="text-gray-400 text-sm mt-1">Start by adding your first cake to your catalog</p>
            <Link href="/vendor/cakes/upload">
              <button className="mt-6 flex items-center gap-2 px-6 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition mx-auto">
                <Plus size={18} /> Add Your First Cake
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cakes.map((cake) => (
              <div key={cake.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden group">
                  {cake.images && cake.images.length > 0 ? (
                    <img
                      src={cake.images[0]}
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cake.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cake.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 line-clamp-2">{cake.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{cake.category}</p>
                  </div>

                  {/* Price */}
                  <div className="border-t pt-3">
                    <p className="text-lg font-bold text-gray-900">₹{cake.basePrice}</p>
                  </div>

                  {/* Flavors & Toppings */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-semibold">Flavors:</span>{' '}
                      {cake.flavors?.slice(0, 2).join(', ') || 'N/A'}
                      {cake.flavors && cake.flavors.length > 2 && ` +${cake.flavors.length - 2}`}
                    </p>
                    <p>
                      <span className="font-semibold">Toppings:</span>{' '}
                      {cake.customOptions?.toppings?.slice(0, 2).join(', ') || 'N/A'}
                      {cake.customOptions?.toppings && cake.customOptions.toppings.length > 2 && ` +${cake.customOptions.toppings.length - 2}`}
                    </p>
                  </div>

                  {/* Images */}
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Images:</span> {cake.images?.length || 0}/4
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Link href={`/vendor/cakes/${cake.id}/edit`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition">
                        <Edit2 size={14} /> Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteCake(cake.id)}
                      disabled={deletingId === cake.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} /> {deletingId === cake.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cakes.length > 0 && cakes.length < 4 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">{cakes.length}/4</span> cakes uploaded. You can add{' '}
              <span className="font-semibold">{4 - cakes.length}</span> more cake{4 - cakes.length !== 1 ? 's' : ''}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
