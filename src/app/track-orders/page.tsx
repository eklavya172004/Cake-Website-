'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LogIn, Mail, ArrowRight } from 'lucide-react';

export default function TrackOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // Redirect signed-in users to /orders
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/orders');
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status, session, router]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [error, setError] = useState('');

  const handleLoginClick = () => {
    router.push('/auth/customer-login');
  };

  const handleGuestTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!guestEmail) {
      setError('Please enter your email');
      return;
    }

    setLoadingGuest(true);

    try {
      const response = await fetch('/api/guest-orders-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestEmail.toLowerCase() }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      // Redirect to guest orders list page
      router.push(`/guest-orders-list?email=${encodeURIComponent(guestEmail.toLowerCase())}`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoadingGuest(false);
    }
  };

  // Show loading state or redirect message while checking auth
  if (status === 'loading' || isLoading || (status === 'authenticated' && session)) {
    return (
      <div className="min-h-screen mt-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition-colors font-medium"
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-xl text-gray-600">Choose how you'd like to track your cake order</p>
        </div>

        {/* Two Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Option 1: Login */}
          <button
            onClick={handleLoginClick}
            className="group bg-white rounded-3xl shadow-lg border-2 border-pink-200 hover:border-pink-600 p-8 text-left transition-all hover:shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-pink-100 rounded-full p-4 group-hover:bg-pink-200 transition-colors">
                <LogIn className="w-8 h-8 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sign In to Account</h2>
                <p className="text-sm text-gray-600 mt-1">Track all your orders in one place</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-pink-600 font-bold">✓</span>
                <span>View all your orders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-600 font-bold">✓</span>
                <span>Real-time tracking updates</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-600 font-bold">✓</span>
                <span>Order history & receipts</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-600 font-bold">✓</span>
                <span>Quick reorder from favorites</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-pink-600 font-semibold group-hover:gap-4 transition-all">
              Sign In Now <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Option 2: Guest Tracking */}
          <button
            onClick={() => setShowGuestForm(!showGuestForm)}
            className="group bg-white rounded-3xl shadow-lg border-2 border-blue-200 hover:border-blue-600 p-8 text-left transition-all hover:shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 rounded-full p-4 group-hover:bg-blue-200 transition-colors">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Track as Guest</h2>
                <p className="text-sm text-gray-600 mt-1">No account needed</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Use email to track orders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>See all ongoing orders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Real-time status updates</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Share tracking link</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
              Track as Guest <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Guest Form Section */}
        {showGuestForm && (
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Enter Your Email</h3>

            <form onSubmit={handleGuestTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">The email you used for your order</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingGuest}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loadingGuest ? 'Loading your orders...' : 'Find My Orders'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Enter the email address associated with your order to see all your ongoing and pending orders.
              </p>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do I need to create an account to track my order?</h4>
              <p className="text-gray-600">No! You can track your order as a guest using just your email address. However, creating an account gives you access to your complete order history and exclusive offers.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How often are tracking updates provided?</h4>
              <p className="text-gray-600">You'll receive real-time updates as your order progresses through our system. Key milestones like confirmation, preparation, and delivery will trigger notifications.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I share my tracking status with others?</h4>
              <p className="text-gray-600">Yes! When tracking as a guest, you can copy the tracking link and share it with anyone. They can use your email to view the order status without creating an account.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What if my email doesn't have any orders?</h4>
              <p className="text-gray-600">If no orders are found, make sure you're using the correct email address. You can also sign in to create an account and check your order history.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need help? <Link href="/" className="text-pink-600 font-semibold hover:text-pink-700">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
