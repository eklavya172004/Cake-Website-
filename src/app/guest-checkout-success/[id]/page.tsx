'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { CheckCircle, User, LogIn, Copy, Share2, ArrowRight, Loader } from 'lucide-react';

interface OrderData {
  id: string;
  user: {
    email: string;
  };
}

export default function GuestCheckoutSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [copied, setCopied] = useState(false);
  const [orderEmail, setOrderEmail] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [accountForm, setAccountForm] = useState({
    password: '',
    confirmPassword: '',
    loading: false,
    error: '',
  });

  // Fetch order email on mount
  useEffect(() => {
    const fetchOrderEmail = async () => {
      try {
        // Try to fetch the order (this will work for the logged-in user)
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const order: OrderData = await response.json();
          setOrderEmail(order.user.email);
        } else {
          // If unauthorized, we might not have the email yet
          // It was passed through form data, so ask user to enter it
          console.log('Could not auto-fetch email');
        }
      } catch (error) {
        console.error('Error fetching order email:', error);
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrderEmail();
  }, [orderId]);

  const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/guest-orders/${orderId}`;

  const copyTrackingUrl = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderEmail) {
      setAccountForm(prev => ({ ...prev, error: 'Email is required' }));
      return;
    }

    if (accountForm.password !== accountForm.confirmPassword) {
      setAccountForm(prev => ({ ...prev, error: 'Passwords do not match' }));
      return;
    }

    if (accountForm.password.length < 6) {
      setAccountForm(prev => ({ ...prev, error: 'Password must be at least 6 characters' }));
      return;
    }

    setAccountForm(prev => ({ ...prev, loading: true, error: '' }));

    try {
      // Sign in with the email and password
      const result = await signIn('credentials', {
        email: orderEmail,
        password: accountForm.password,
        redirect: false,
      });

      if (result?.error) {
        setAccountForm(prev => ({ ...prev, error: result.error || 'Failed to create account' }));
      } else {
        // Redirect to profile page
        router.push('/profile');
      }
    } catch (error: any) {
      setAccountForm(prev => ({ ...prev, error: error.message || 'An error occurred' }));
    } finally {
      setAccountForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleContinueAsGuest = () => {
    router.push(`/guest-orders/${orderId}`);
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 pt-32">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-pink-100 to-orange-100 rounded-full p-6 mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Placed Successfully! 🎉</h1>
          <p className="text-xl text-gray-600">Your order <strong>#{orderId}</strong> has been confirmed</p>
        </div>

        {/* Choice Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create Account Option */}
          <button
            onClick={() => setShowCreateAccount(!showCreateAccount)}
            className="group bg-white rounded-2xl shadow-lg border-2 border-pink-200 hover:border-pink-600 p-6 text-left transition-all hover:shadow-xl"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-pink-100 rounded-full p-3 group-hover:bg-pink-200 transition-colors">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                <p className="text-sm text-gray-600 mt-1">Save your details for faster checkout</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Faster future checkouts</li>
              <li>✓ Track all your orders</li>
              <li>✓ Exclusive offers & rewards</li>
            </ul>
            <div className="mt-4 text-pink-600 font-semibold text-sm flex items-center gap-2">
              {showCreateAccount ? 'Hide Form' : 'Create Account'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Continue as Guest Option */}
          <button
            onClick={handleContinueAsGuest}
            className="group bg-white rounded-2xl shadow-lg border-2 border-blue-200 hover:border-blue-600 p-6 text-left transition-all hover:shadow-xl"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 rounded-full p-3 group-hover:bg-blue-200 transition-colors">
                <LogIn className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Continue as Guest</h2>
                <p className="text-sm text-gray-600 mt-1">Track without creating an account</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ No account needed</li>
              <li>✓ Track with email + order ID</li>
              <li>✓ Share tracking link</li>
            </ul>
            <div className="mt-4 text-blue-600 font-semibold text-sm flex items-center gap-2">
              Track Order <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Create Account Form */}
        {showCreateAccount && (
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Set Up Your Account</h3>

            {loadingOrder ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-pink-600" />
              </div>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={orderEmail}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email from your order</p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Create Password</label>
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter a strong password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={accountForm.confirmPassword}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {accountForm.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {accountForm.error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={accountForm.loading}
                  className="w-full bg-gradient-to-r from-pink-600 to-orange-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accountForm.loading ? 'Creating Account...' : 'Create Account & Sign In'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Guest Tracking Info */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-8">
          <div className="flex gap-4 mb-4">
            <Share2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Track Your Order Anytime</h3>
              <p className="text-sm text-gray-600 mb-4">You can access your order tracking from this link. Share it with anyone to show them the order status.</p>

              <div className="bg-white rounded-lg p-4 flex gap-3 items-center">
                <code className="text-sm text-gray-700 flex-1 break-all">
                  {trackingUrl}
                </code>
                <button
                  onClick={copyTrackingUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-gray-600">
            <Link href="/" className="text-pink-600 font-semibold hover:text-pink-700">
              Continue Shopping
            </Link>
            {' '} • {' '}
            <Link href="/" className="text-pink-600 font-semibold hover:text-pink-700">
              Back to Home
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            You will receive an email confirmation shortly with order details and tracking information.
          </p>
        </div>
      </div>
    </div>
  );
}
