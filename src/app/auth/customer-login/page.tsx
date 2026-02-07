'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Cake, ArrowLeft } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Trim whitespace from all fields
      const trimmedEmail = formData.email.trim();
      const trimmedPassword = formData.password.trim();
      const trimmedName = formData.name.trim();
      const trimmedPhone = formData.phone.trim();

      if (!trimmedEmail || !trimmedPassword) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      if (isSignUp) {
        if (!trimmedName) {
          setError('First name is required');
          setLoading(false);
          return;
        }
        if (!trimmedPhone) {
          setError('Phone number is required');
          setLoading(false);
          return;
        }
        // Validate phone number format (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(trimmedPhone)) {
          setError('Please enter a valid 10-digit phone number');
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        email: trimmedEmail,
        password: trimmedPassword,
        isSignUp: isSignUp.toString(),
        firstName: trimmedName,
        phone: trimmedPhone,
        role: 'customer',
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-44 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Cake className="w-10 h-10 text-pink-600" />
            <span className="text-2xl font-bold text-gray-900">PurblePalace</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Join us and start ordering delicious cakes' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (10 digits)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
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
                setFormData({ email: '', password: '', name: '', phone: '' });
              }}
              className="text-pink-600 hover:text-pink-700 font-medium text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-sm text-pink-900">
          <p className="font-semibold mb-2">🍰 Order Fresh Cakes</p>
          <p>Sign up or login to browse and order delicious cakes from our vendor partners near you.</p>
        </div>
      </div>
    </div>
  );
}
