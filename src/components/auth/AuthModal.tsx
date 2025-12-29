'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // First create the account via custom endpoint
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            isSignUp: true,
            firstName,
            phone
          })
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to create account');
          setLoading(false);
          return;
        }
      }

      // Sign in with NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        isSignUp: isSignUp ? 'true' : 'false',
        firstName: isSignUp ? firstName : undefined,
        phone: isSignUp ? phone : undefined,
        redirect: false
      });

      if (result?.error) {
        setError(result.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Success - close modal and redirect
      onClose();
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#FFF9EB] rounded-lg max-w-md w-full p-8 shadow-2xl border border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="serif text-3xl">{isSignUp ? 'Sign Up' : 'Login'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Login Button - Disabled for now */}
        {/* <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#1a1a1a] text-[#1a1a1a] font-semibold hover:bg-[#1a1a1a] hover:text-[#F7E47D] transition-colors uppercase tracking-widest text-xs mb-6"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <text x="12" y="18" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="bold">G</text>
          </svg>
          Login with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#FFF9EB] text-gray-500">Or with email</span>
          </div>
        </div> */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs uppercase tracking-widest font-bold block mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-3 border border-[#1a1a1a] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] transition-colors"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest font-bold block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-[#1a1a1a] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] transition-colors"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="text-xs uppercase tracking-widest font-bold block mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-[#1a1a1a] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] transition-colors"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest font-bold block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-[#1a1a1a] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] transition-colors"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-[#F7E47D] py-3 font-semibold hover:bg-black transition-all duration-300 uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center mb-3">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setEmail('');
              setPassword('');
              setFirstName('');
              setPhone('');
            }}
            className="w-full border border-[#1a1a1a] text-[#1a1a1a] py-3 font-semibold hover:bg-[#1a1a1a] hover:text-[#F7E47D] transition-colors uppercase tracking-widest text-xs"
          >
            {isSignUp ? 'Login Instead' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
