'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Dispute {
  id: string;
  vendorName: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'open' | 'resolved' | 'escalated';
  date: string;
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/disputes');
        if (!response.ok) throw new Error('Failed to fetch disputes');
        const data = await response.json();
        setDisputes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const handleResolveDispute = async (disputeId: string) => {
    setResolvingId(disputeId);
    try {
      const response = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to resolve dispute');
      
      setDisputes(disputes.map(d =>
        d.id === disputeId ? { ...d, status: 'resolved' } : d
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading disputes...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-600 mt-1">Handle customer and vendor disputes</p>
      </div>

      {error && (
        <div className="bg-red-50 rounded-xl shadow-sm p-6 text-red-600 border border-red-200">Error: {error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-red-600 group">
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Open Disputes</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{disputes.filter(d => d.status === 'open').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-green-600 group">
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Resolved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{disputes.filter(d => d.status === 'resolved').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border-l-4 border-purple-600 group">
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Amount</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">₹{disputes.reduce((sum, d) => sum + d.amount, 0)}</p>
        </div>
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
            {disputes.length > 0 ? (
              disputes.map((dispute) => (
                <tr key={dispute.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{dispute.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{dispute.vendorName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{dispute.customerName}</td>
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
                    {dispute.status === 'open' ? (
                      <button 
                        onClick={() => handleResolveDispute(dispute.id)}
                        disabled={resolvingId === dispute.id}
                        className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold hover:underline transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={18} />
                        Resolve
                      </button>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No disputes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
