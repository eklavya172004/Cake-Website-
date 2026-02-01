'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, Clock, Mail, Phone, MapPin, DollarSign, Clock3 } from 'lucide-react';

interface ServiceArea {
  location: string;
  pincodes: string;
  deliveryFee: number;
  operatingHours: {
    start: string;
    end: string;
  };
}

interface OnboardingStatus {
  status: string;
  submittedAt: string;
  businessName: string;
  businessType: string;
  businessRegistration: string;
  gstNumber: string;
  panNumber: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankAccountHolderName: string;
  serviceAreas: ServiceArea[];
}

export default function OnboardingStatusPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [statusData, setStatusData] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/vendor/onboarding/status', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            router.push('/vendor/onboarding');
            return;
          }
          throw new Error('Failed to fetch onboarding status');
        }

        const data = await response.json();
        setStatusData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-6 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="text-gray-600 mt-4">Loading your status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-6 pt-32">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: Clock };
      case 'approved':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle };
      case 'rejected':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: Clock };
    }
  };

  const statusConfig = getStatusColor(statusData.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-6 pt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Status</h1>
          <p className="text-gray-600 mt-2">Review your submitted information</p>
        </div>

        {/* Status Banner */}
        <div className={`${statusConfig.bg} border-2 ${statusConfig.border} rounded-xl p-8 mb-8`}>
          <div className="flex items-start gap-4">
            <StatusIcon className={`w-8 h-8 ${statusConfig.text} shrink-0 mt-1`} />
            <div>
              <h2 className={`text-2xl font-bold ${statusConfig.text}`}>
                {statusData.status.charAt(0).toUpperCase() + statusData.status.slice(1)}
              </h2>
              <p className={`text-sm ${statusConfig.text} mt-1`}>
                Submitted on {new Date(statusData.submittedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {statusData.status.toLowerCase() === 'pending' && (
                <p className={`text-sm ${statusConfig.text} mt-2 font-semibold`}>
                  Your application is under review. We'll notify you once approved.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Business Name</p>
              <p className="text-lg text-gray-900 mt-1">{statusData.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Business Type</p>
              <p className="text-lg text-gray-900 mt-1">{statusData.businessType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Registration Number</p>
              <p className="text-lg text-gray-900 mt-1">{statusData.businessRegistration}</p>
            </div>
            {statusData.gstNumber && (
              <div>
                <p className="text-sm text-gray-600 font-semibold">GST Number</p>
                <p className="text-lg text-gray-900 mt-1">{statusData.gstNumber}</p>
              </div>
            )}
            {statusData.panNumber && (
              <div>
                <p className="text-sm text-gray-600 font-semibold">PAN Number</p>
                <p className="text-lg text-gray-900 mt-1">{statusData.panNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            Owner Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Owner Name</p>
              <p className="text-lg text-gray-900 mt-1">{statusData.ownerName}</p>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Phone Number</p>
                <p className="text-lg text-gray-900 mt-1">{statusData.ownerPhone}</p>
              </div>
              <a href={`tel:${statusData.ownerPhone}`} className="text-pink-600 hover:text-pink-700">
                <Phone className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Email Address</p>
                <p className="text-lg text-gray-900 mt-1">{statusData.ownerEmail}</p>
              </div>
              <a href={`mailto:${statusData.ownerEmail}`} className="text-pink-600 hover:text-pink-700">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            Bank Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Account Holder Name</p>
              <p className="text-lg text-gray-900 mt-1">{statusData.bankAccountHolderName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Account Number</p>
              <p className="text-lg text-gray-900 mt-1">
                {statusData.bankAccountNumber.slice(-4).padStart(statusData.bankAccountNumber.length, '*')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Last 4 digits shown for security</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">IFSC Code</p>
              <p className="text-lg text-gray-900 mt-1">{statusData.bankIfscCode}</p>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            Service Areas
          </h3>
          <div className="space-y-6">
            {statusData.serviceAreas.map((area, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-600" />
                  {area.location}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Service Pincodes</p>
                    <p className="text-gray-900 mt-1 text-sm">{area.pincodes}</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Delivery Fee</p>
                      <p className="text-lg text-gray-900 mt-1 font-semibold">₹{area.deliveryFee}</p>
                    </div>
                    <DollarSign className="w-5 h-5 text-pink-600 mb-1" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Operating Hours</p>
                      <p className="text-gray-900 mt-1">{area.operatingHours.start} - {area.operatingHours.end}</p>
                    </div>
                    <Clock3 className="w-5 h-5 text-pink-600 mb-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/vendor')}
            className="px-8 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/vendor/onboarding')}
            className="px-8 py-3 border-2 border-pink-600 text-pink-600 font-semibold rounded-lg hover:bg-pink-50 transition-all duration-300"
          >
            Edit Information
          </button>
        </div>
      </div>
    </div>
  );
}
