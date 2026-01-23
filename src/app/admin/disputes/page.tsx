'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Dispute {
  id: string;
  vendor: string;
  customer: string;
  amount: number;
  reason: string;
  status: 'open' | 'resolved' | 'escalated';
  date: string;
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for disputes
    setDisputes([
      { id: '1', vendor: 'Sweet Delights', customer: 'Raj', amount: 500, reason: 'Quality Issue', status: 'open', date: '2025-01-05' },
      { id: '2', vendor: 'Cake Paradise', customer: 'Priya', amount: 800, reason: 'Late Delivery', status: 'open', date: '2025-01-06' },
    ]);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6">Loading disputes...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-600 mt-1">Handle customer and vendor disputes</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dispute ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vendor</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reason</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((dispute) => (
              <tr key={dispute.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{dispute.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{dispute.vendor}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{dispute.customer}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{dispute.amount}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{dispute.reason}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    dispute.status === 'open' ? 'bg-red-100 text-red-800' :
                    dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-pink-600 hover:text-pink-800 font-semibold hover:underline transition-colors">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
