'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Cake, X } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'vendor' | 'admin'>('vendor');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);
    setForgotPasswordLoading(true);

    try {
      if (!forgotPasswordEmail) {
        setForgotPasswordError('Email is required');
        setForgotPasswordLoading(false);
        return;
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setForgotPasswordError(data.error || 'Failed to send reset email');
        setForgotPasswordLoading(false);
        return;
      }

      setForgotPasswordSuccess(true);
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setForgotPasswordEmail('');
        setForgotPasswordSuccess(false);
      }, 3000);
    } catch (err: any) {
      setForgotPasswordError(err.message || 'An error occurred');
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      if (isSignUp && (!formData.firstName || !formData.phone)) {
        setError('All fields are required for signup');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        isSignUp: isSignUp.toString(),
        firstName: formData.firstName,
        phone: formData.phone,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // For signup, store password in sessionStorage to be used during onboarding
      if (isSignUp) {
        sessionStorage.setItem('signupPassword', formData.password);
      }

      // Redirect based on role
      if (role === 'vendor') {
        router.push('/vendor');
      } else if (role === 'admin') {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-32 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cake className="w-10 h-10 text-pink-600" />
            <span className="text-2xl font-bold text-gray-900">PurblePalace</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'vendor', label: 'Vendor', icon: '🏪' },
                { id: 'admin', label: 'Admin', icon: '⚙️' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id as 'vendor' | 'admin');
                    setError('');
                  }}
                  className={`py-2 px-3 rounded-lg border-2 transition text-center font-medium text-sm ${
                    role === r.id
                      ? 'border-pink-600 bg-pink-50 text-pink-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300'
                  }`}
                >
                  <div className="text-xl mb-1">{r.icon}</div>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ email: '', password: '', firstName: '', phone: '' });
              }}
              className="text-pink-600 hover:text-pink-700 font-medium text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Forgot Password?</h2>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordEmail('');
                  setForgotPasswordError('');
                  setForgotPasswordSuccess(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotPasswordSuccess ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-green-700 font-medium">
                  Reset link sent successfully! Check your email for instructions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {forgotPasswordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    {forgotPasswordError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordError('');
                  }}
                  className="w-full text-gray-600 hover:text-gray-900 font-medium py-2"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
