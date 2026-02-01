'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Landmark, Building, CheckCircle, Clock, AlertCircle, Edit2 } from 'lucide-react';

interface ServiceArea {
  location: string;
  pincodes: string;
  deliveryFee: number;
  operatingHours: {
    start: string;
    end: string;
  };
}

interface VendorProfileData {
  status: string;
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

export default function VendorProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<VendorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/vendor/onboarding/status', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('No profile data found. Please complete onboarding.');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-1">Manage your business profile and information</p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="text-gray-500 mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-1">Manage your business profile and information</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error || 'Could not load profile data'}</p>
            <button
              onClick={() => router.push('/vendor/onboarding')}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusColor(profileData.status);
  const StatusIcon = statusConfig.icon;
  const isApproved = profileData.status.toLowerCase() === 'approved';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-1">Your business profile and verification status</p>
        </div>
        <button
          onClick={() => router.push('/vendor/onboarding/status')}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
        >
          <Edit2 size={18} /> Edit Profile
        </button>
      </div>

      {/* Status Card */}
      <div className={`${statusConfig.bg} border-2 ${statusConfig.border} rounded-xl p-6`}>
        <div className="flex items-center gap-4">
          <StatusIcon className={`w-8 h-8 ${statusConfig.text} shrink-0`} />
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${statusConfig.text}`}>
              {profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1)}
            </h2>
            <p className={`text-sm ${statusConfig.text} mt-1`}>
              {isApproved
                ? 'Your profile is verified. You can start selling cakes!'
                : profileData.status.toLowerCase() === 'pending'
                ? 'Your profile is under review. We will notify you once approved.'
                : 'Your profile was rejected. Please update and resubmit.'}
            </p>
          </div>
          {isApproved && (
            <button
              onClick={() => router.push('/vendor/products')}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition whitespace-nowrap"
            >
              Start Selling
            </button>
          )}
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
          <Building className="w-6 h-6 text-pink-600" />
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Business Name</p>
            <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.businessName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Business Type</p>
            <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.businessType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Registration Number</p>
            <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.businessRegistration}</p>
          </div>
          {profileData.gstNumber && (
            <div>
              <p className="text-sm text-gray-600 font-semibold">GST Number</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.gstNumber}</p>
            </div>
          )}
          {profileData.panNumber && (
            <div>
              <p className="text-sm text-gray-600 font-semibold">PAN Number</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.panNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Owner Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Owner Name</p>
            <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.ownerName}</p>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-semibold">Phone Number</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.ownerPhone}</p>
            </div>
            <a
              href={`tel:${profileData.ownerPhone}`}
              className="ml-3 p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
              title="Call owner"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
          <div className="flex items-end justify-between md:col-span-2">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-semibold">Email Address</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.ownerEmail}</p>
            </div>
            <a
              href={`mailto:${profileData.ownerEmail}`}
              className="ml-3 p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
              title="Send email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
          <Landmark className="w-6 h-6 text-pink-600" />
          Bank Account Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Account Holder Name</p>
            <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.bankAccountHolderName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">IFSC Code</p>
            <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.bankIfscCode}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 font-semibold">Account Number</p>
            <p className="text-lg text-gray-900 mt-2 font-medium">
              {profileData.bankAccountNumber.slice(-4).padStart(profileData.bankAccountNumber.length, '*')}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last 4 digits shown for security</p>
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-pink-600" />
          Service Areas
        </h3>
        <div className="space-y-4">
          {profileData.serviceAreas.map((area, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
              <h4 className="font-semibold text-gray-900 mb-3">{area.location}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-semibold">Pincodes</p>
                  <p className="text-gray-900 mt-1">{area.pincodes}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Delivery Fee</p>
                  <p className="text-gray-900 mt-1 font-semibold">₹{area.deliveryFee}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Opening</p>
                  <p className="text-gray-900 mt-1">{area.operatingHours.start}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Closing</p>
                  <p className="text-gray-900 mt-1">{area.operatingHours.end}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {isApproved && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/vendor/products')}
            className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md hover:shadow-lg"
          >
            📦 Sell Cakes
          </button>
          <button
            onClick={() => router.push('/vendor/orders')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md hover:shadow-lg"
          >
            🛍️ View Orders
          </button>
          <button
            onClick={() => router.push('/vendor/analytics')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition shadow-md hover:shadow-lg"
          >
            📊 Analytics
          </button>
        </div>
      )}
    </div>
  );
}

