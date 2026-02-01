'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import CakeUploadForm from '@/components/vendor/CakeUploadForm';

interface VerificationStatus {
  status: string;
}

export default function UploadCakePage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [cakeCount, setCakeCount] = useState(0);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await fetch('/api/vendor/onboarding/status', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setVerificationStatus(data.status || 'pending');
        }

        // Get cake count
        const cakesResponse = await fetch('/api/vendor/products', {
          credentials: 'include',
        });

        if (cakesResponse.ok) {
          const cakes = await cakesResponse.json();
          setCakeCount(cakes.length || 0);
        }
      } catch (err) {
        console.error('Error fetching status:', err);
      } finally {
        setCheckingStatus(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  const isApproved = verificationStatus.toLowerCase() === 'approved';

  if (checkingStatus) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Cake</h1>
          <p className="text-gray-600 mt-1">Add cakes to your catalog</p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Cake</h1>
        <p className="text-gray-600 mt-1">Add cakes to your catalog and start selling</p>
        {isApproved && (
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700 font-semibold">
              Your profile is verified. You can upload up to 4 cakes. ({cakeCount}/4 uploaded)
            </span>
          </div>
        )}
      </div>

      {/* Verification Status Alert */}
      {!isApproved && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900">Verification Required</h3>
              <p className="text-yellow-800 mt-2">
                Your profile needs to be verified before you can upload cakes. 
                {verificationStatus.toLowerCase() === 'pending' && ' Your application is currently under review.'}
                {verificationStatus.toLowerCase() === 'rejected' && ' Your application was rejected. Please update your profile and resubmit.'}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => router.push('/vendor/onboarding')}
                  className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
                >
                  Complete Onboarding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Max Cakes Alert */}
      {isApproved && cakeCount >= 4 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900">Maximum Cakes Reached</h3>
              <p className="text-blue-800 mt-2">
                You have uploaded the maximum number of cakes (4). To upload more cakes, delete some existing ones or contact support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form - Only show if approved and hasn't reached max */}
      {isApproved && cakeCount < 4 && (
        <CakeUploadForm
          onSuccess={() => {
            // Refresh cake count
            fetch('/api/vendor/products', { credentials: 'include' })
              .then((res) => res.json())
              .then((cakes) => setCakeCount(cakes.length || 0));
          }}
        />
      )}
    </div>
  );
}
