'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Cake, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(4); // Start with full attempts
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(0);

  // Verify email with token
  const handleVerifyEmail = async () => {
    if (!token) {
      setError('No verification token provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(true);
      setEmail(data.email);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/customer-login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async () => {
    if (!email) {
      setError('Email is required to resend verification');
      return;
    }

    setResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a lockout error
        if (response.status === 429) {
          setIsLockedOut(true);
          setLockoutMinutes(data.minutesRemaining || 15);
          setError(`Too many attempts. Please try again in ${data.minutesRemaining || 15} minutes.`);
        } else {
          setError(data.error || 'Failed to resend email');
        }
        setResending(false);
        return;
      }

      // Start cooldown timer (10 seconds)
      setResendCooldown(10);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const attemptsLeft = data.attemptsRemaining || 0;
      setResendAttempts(attemptsLeft);
      setIsLockedOut(false);

      // Show success message
      if (attemptsLeft > 0) {
        toast.success(`Verification email sent! You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`);
      } else {
        toast.error('This was your last attempt. If you don\'t receive the email, please try again in 15 minutes.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  // Auto-verify if token is present
  useEffect(() => {
    if (token && !success && !loading) {
      handleVerifyEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
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
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            Click the button below to verify your email address
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {success ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">
                Your email has been successfully verified. You can now login with your credentials.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Redirecting to login page in 3 seconds...
              </p>
              <Link
                href="/auth/customer-login"
                className="inline-block text-pink-600 hover:text-pink-700 font-medium"
              >
                Go to Login Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {token ? (
                <>
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <Clock className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>
                    <p className="text-gray-600">Verifying your email...</p>
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  {error && (
                    <button
                      onClick={() => window.location.href = '/auth/verify-email'}
                      className="w-full text-pink-600 hover:text-pink-700 font-medium text-sm"
                    >
                      Need to resend? Enter your email below
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleResendEmail}
                    disabled={resending || resendCooldown > 0 || isLockedOut || resendAttempts <= 0}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
                  </button>

                  {!isLockedOut && resendAttempts > 0 && (
                    <p className="text-xs text-gray-600 text-center">
                      {resendAttempts} attempt{resendAttempts === 1 ? '' : 's'} remaining
                    </p>
                  )}

                  {isLockedOut && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      🔒 <strong>Account Locked</strong><br />Too many resend attempts. Please try again in {lockoutMinutes} minute{lockoutMinutes === 1 ? '' : 's'}.
                    </div>
                  )}

                  {!isLockedOut && resendAttempts === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                      ⚠️ No attempts remaining. Please check your email for the verification link, or try again in 15 minutes.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Back to Login */}
          {!success && !token && (
            <div className="mt-4 text-center">
              <Link
                href="/auth/customer-login"
                className="text-pink-600 hover:text-pink-700 font-medium text-sm"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-2">📧 Email Verification</p>
          <p>A verification link has been sent to your email. Click it to verify your account. The link expires in 5 minutes.</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
