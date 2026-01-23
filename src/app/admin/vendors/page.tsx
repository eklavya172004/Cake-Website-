'use client';

import { useEffect, useState } from 'react';
import { Eye, Check, X, AlertCircle } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  owner: string;
  orders: number;
  revenue: number;
  rating: number;
  status: string;
  verification: string;
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/vendors');
        if (!response.ok) throw new Error('Failed to fetch vendors');
        const data = await response.json();
        setVendors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-600 mt-2 text-lg">Manage vendors, verify requests, and track performance</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">Loading vendors...</div>
      ) : error ? (
        <div className="bg-red-50 rounded-xl shadow-sm p-6 text-red-600 border border-red-200">Error: {error}</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-pink-600 group">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{vendors.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-green-600 group">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{vendors.filter(v => v.status === 'approved').length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-yellow-600 group">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{vendors.filter(v => v.status === 'pending').length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-purple-600 group">
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">₹{(vendors.reduce((sum, v) => sum + v.revenue, 0) / 100000).toFixed(1)}L</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search vendors..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent">
              <option>All Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent">
              <option>All Verification</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* Vendors Table */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Owner</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Orders</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Verification</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{vendor.owner}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{vendor.orders}</td>
                    <td className="px-6 py-4 font-semibold text-pink-600">₹{(vendor.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-6 py-4">
                      {vendor.rating > 0 ? (
                        <span className="text-yellow-600 font-semibold">⭐ {vendor.rating}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        vendor.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : vendor.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        vendor.verification === 'verified'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {vendor.verification.charAt(0).toUpperCase() + vendor.verification.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <Eye size={18} />
                        </button>
                        {vendor.status === 'pending' && (
                          <>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                              <Check size={18} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                              <X size={18} />
                            </button>
                          </>
                        )}
                        {vendor.verification === 'pending' && (
                          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Verify">
                            <AlertCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
