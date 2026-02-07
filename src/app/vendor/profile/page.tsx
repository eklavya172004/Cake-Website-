'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Landmark, Building, CheckCircle, Clock, AlertCircle, Edit2, Save, X, Truck } from 'lucide-react';

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
  shopPhone?: string;
  shopEmail?: string;
  shopAddress?: string;
  deliveryFee: number;
  serviceAreas: ServiceArea[];
}

interface FormData {
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
  shopPhone: string;
  shopEmail: string;
  shopAddress: string;
  deliveryFee: number;
}

export default function VendorProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<VendorProfileData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
        // Initialize form data with profile data
        setFormData({
          businessName: data.businessName || '',
          businessType: data.businessType || '',
          businessRegistration: data.businessRegistration || '',
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          ownerName: data.ownerName || '',
          ownerPhone: data.ownerPhone || '',
          ownerEmail: data.ownerEmail || '',
          bankAccountNumber: data.bankAccountNumber || '',
          bankIfscCode: data.bankIfscCode || '',
          bankAccountHolderName: data.bankAccountHolderName || '',
          shopPhone: data.shopPhone || '',
          shopEmail: data.shopEmail || '',
          shopAddress: data.shopAddress || '',
          deliveryFee: data.deliveryFee || 50,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    if (formData) {
      setFormData(prev => {
        if (!prev) return null;
        // Convert deliveryFee to number, keep others as strings
        const finalValue = field === 'deliveryFee' ? (parseFloat(String(value)) || 0) : value;
        return {
          ...prev,
          [field]: finalValue,
        } as FormData;
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!formData) return;

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      setSuccessMessage('Profile updated successfully!');
      setIsEditMode(false);
      
      // Refresh profile data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profileData) {
      setFormData({
        businessName: profileData.businessName || '',
        businessType: profileData.businessType || '',
        businessRegistration: profileData.businessRegistration || '',
        gstNumber: profileData.gstNumber || '',
        panNumber: profileData.panNumber || '',
        ownerName: profileData.ownerName || '',
        ownerPhone: profileData.ownerPhone || '',
        ownerEmail: profileData.ownerEmail || '',
        bankAccountNumber: profileData.bankAccountNumber || '',
        bankIfscCode: profileData.bankIfscCode || '',
        bankAccountHolderName: profileData.bankAccountHolderName || '',
        shopPhone: profileData.shopPhone || '',
        shopEmail: profileData.shopEmail || '',
        shopAddress: profileData.shopAddress || '',
        deliveryFee: profileData.deliveryFee || 50,
      });
    }
    setIsEditMode(false);
    setError('');
  };

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
        {!isEditMode && (
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            <Edit2 size={18} /> Edit Profile
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">{successMessage}</h3>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

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
        {isEditMode && formData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Business Name *</label>
              <input
                type="text"
                aria-label="Business Name"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Business Type *</label>
              <select
                aria-label="Business Type"
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Type</option>
                <option value="Sole Proprietor">Sole Proprietor</option>
                <option value="Partnership">Partnership</option>
                <option value="Company">Company</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Registration Number</label>
              <input
                type="text"
                aria-label="Registration Number"
                value={formData.businessRegistration}
                onChange={(e) => handleInputChange('businessRegistration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">GST Number</label>
              <input
                type="text"
                aria-label="GST Number"
                value={formData.gstNumber}
                onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">PAN Number</label>
              <input
                type="text"
                aria-label="PAN Number"
                value={formData.panNumber}
                onChange={(e) => handleInputChange('panNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Business Name</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData?.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Business Type</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData?.businessType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">Registration Number</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData?.businessRegistration}</p>
            </div>
            {profileData?.gstNumber && (
              <div>
                <p className="text-sm text-gray-600 font-semibold">GST Number</p>
                <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.gstNumber}</p>
              </div>
            )}
            {profileData?.panNumber && (
              <div>
                <p className="text-sm text-gray-600 font-semibold">PAN Number</p>
                <p className="text-lg text-gray-900 mt-2 font-medium">{profileData.panNumber}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Owner Details</h3>
        {isEditMode && formData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Owner Name *</label>
              <input
                type="text"
                aria-label="Owner Name"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Phone Number *</label>
              <input
                type="tel"
                aria-label="Phone Number"
                value={formData.ownerPhone}
                onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 font-semibold mb-2">Email Address *</label>
              <input
                type="email"
                aria-label="Email Address"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Owner Name</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData?.ownerName}</p>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-semibold">Phone Number</p>
                <p className="text-lg text-gray-900 mt-2 font-medium">{profileData?.ownerPhone}</p>
              </div>
              <a
                href={`tel:${profileData?.ownerPhone}`}
                className="ml-3 p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
                title="Call owner"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-end justify-between md:col-span-2">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-semibold">Email Address</p>
                <p className="text-lg text-gray-900 mt-2 font-medium">{profileData?.ownerEmail}</p>
              </div>
              <a
                href={`mailto:${profileData?.ownerEmail}`}
                className="ml-3 p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition"
                title="Send email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
          <Truck className="w-6 h-6 text-pink-600" />
          Delivery Settings
        </h3>
        {isEditMode && formData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Delivery Fee (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                aria-label="Delivery Fee"
                value={formData.deliveryFee}
                onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">This delivery fee will appear on all your cake listings</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 font-semibold">Delivery Fee</p>
            <p className="text-3xl text-gray-900 mt-2 font-bold">₹{profileData?.deliveryFee || 50}</p>
            <p className="text-xs text-gray-500 mt-2">This fee applies to all customers across all cakes</p>
          </div>
        )}
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
          <Landmark className="w-6 h-6 text-pink-600" />
          Bank Account Details
        </h3>
        {isEditMode && formData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">Account Holder Name *</label>
              <input
                type="text"
                aria-label="Account Holder Name"
                value={formData.bankAccountHolderName}
                onChange={(e) => handleInputChange('bankAccountHolderName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 font-semibold mb-2">IFSC Code *</label>
              <input
                type="text"
                aria-label="IFSC Code"
                value={formData.bankIfscCode}
                onChange={(e) => handleInputChange('bankIfscCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 font-semibold mb-2">Account Number *</label>
              <input
                type="password"
                aria-label="Account Number"
                value={formData.bankAccountNumber}
                onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">Masked for security</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-semibold">Account Holder Name</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData?.bankAccountHolderName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-semibold">IFSC Code</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">{profileData?.bankIfscCode}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 font-semibold">Account Number</p>
              <p className="text-lg text-gray-900 mt-2 font-medium">
                {profileData?.bankAccountNumber.slice(-4).padStart(profileData.bankAccountNumber.length, '*')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Last 4 digits shown for security</p>
            </div>
          </div>
        )}
      </div>

      {/* Service Areas (Read-only) */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-pink-600" />
          Service Areas
        </h3>
        <div className="space-y-4">
          {profileData?.serviceAreas.map((area, index) => (
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

      {/* Edit Mode Action Buttons */}
      {isEditMode && (
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
          >
            <X size={18} /> Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

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

