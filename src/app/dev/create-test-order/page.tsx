'use client';

import React from 'react';

export default function DevTestOrderPage() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const createTestOrder = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      const response = await fetch('/api/dev/create-test-order-for-me', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test order');
      }

      setMessage(data.message);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9EB] p-8">
      <div className="max-w-md mx-auto bg-white border border-[#1a1a1a]/10 rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4">Create Test Order</h1>
        <p className="text-gray-600 mb-6">
          This page is for development only. It creates a test order for your logged-in account so you can test the order details modal.
        </p>

        <button
          onClick={createTestOrder}
          disabled={loading}
          className="w-full bg-[#1a1a1a] text-[#F7E47D] py-3 font-bold rounded hover:bg-black disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Test Order'}
        </button>

        {message && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            ❌ {error}
          </div>
        )}

        <p className="mt-6 text-sm text-gray-500">
          After creating the order, you can go to your profile to see it and test the order details modal by clicking on the order.
        </p>
      </div>
    </div>
  );
}
