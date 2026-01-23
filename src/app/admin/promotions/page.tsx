'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minAmount: number;
  usageCount: number;
  maxUsage: number;
  expiryDate: string;
  active: boolean;
}

export default function AdminPromotions() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for coupons
    setCoupons([
      { id: '1', code: 'WELCOME10', discount: 10, minAmount: 500, usageCount: 145, maxUsage: 500, expiryDate: '2025-03-31', active: true },
      { id: '2', code: 'SPECIAL20', discount: 20, minAmount: 1000, usageCount: 89, maxUsage: 300, expiryDate: '2025-02-28', active: true },
      { id: '3', code: 'NEWYEAR15', discount: 15, minAmount: 750, usageCount: 250, maxUsage: 200, expiryDate: '2025-01-31', active: false },
    ]);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6">Loading promotions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions & Coupons</h1>
          <p className="text-gray-600 mt-1">Manage platform promotions and discount codes</p>
        </div>
        <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md">
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Discount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Min Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Usage</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-900 tracking-wide">{coupon.code}</td>
                <td className="px-6 py-4 text-sm font-semibold text-pink-600">{coupon.discount}%</td>
                <td className="px-6 py-4 text-sm text-gray-900">₹{coupon.minAmount}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{coupon.usageCount} / {coupon.maxUsage}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{coupon.expiryDate}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {coupon.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-3">
                  <button className="text-pink-600 hover:text-pink-800 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
