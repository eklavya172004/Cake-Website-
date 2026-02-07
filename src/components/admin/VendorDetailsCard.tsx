import {
  User,
  Phone,
  Mail,
  Building,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';

interface VendorDetailsProps {
  vendor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profile?: any;
    minOrderAmount: number;
    preparationTime: number;
    verification: string;
    verifiedAt?: string;
    status: string;
    approvedAt?: string;
  };
  onVerificationUpdate?: (verification: string) => void;
}

export default function VendorDetailsCard({ vendor, onVerificationUpdate }: VendorDetailsProps) {
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const handleVerify = async (action: 'verify' | 'reject') => {
    setVerifying(true);
    setVerificationError('');
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to update verification status');
      onVerificationUpdate?.(action === 'verify' ? 'verified' : 'rejected');
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setVerifying(false);
    }
  };
  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <User className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-600">Owner Name</p>
              <p className="text-lg font-medium text-gray-900">
                {vendor.profile?.ownerName || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-gray-900">
                {vendor.profile?.ownerEmail || vendor.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-lg font-medium text-gray-900">{vendor.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-gray-600">Owner Phone</p>
              <p className="text-lg font-medium text-gray-900">
                {vendor.profile?.ownerPhone || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Information */}
      {vendor.profile && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <Building className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-600">Business Name</p>
                <p className="text-lg font-medium text-gray-900">
                  {vendor.profile.businessName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FileText className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-600">Business Type</p>
                <p className="text-lg font-medium text-gray-900">
                  {vendor.profile.businessType}
                </p>
              </div>
            </div>

            {vendor.profile.gstNumber && (
              <div className="flex items-start gap-4">
                <FileText className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-600">GST Number</p>
                  <p className="text-lg font-medium text-gray-900">{vendor.profile.gstNumber}</p>
                </div>
              </div>
            )}

            {vendor.profile.panNumber && (
              <div className="flex items-start gap-4">
                <FileText className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-600">PAN Number</p>
                  <p className="text-lg font-medium text-gray-900">{vendor.profile.panNumber}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Operational Details */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Operational Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Min Order Amount</p>
            <p className="text-2xl font-bold text-gray-900">₹{vendor.minOrderAmount}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Preparation Time</p>
            <p className="text-2xl font-bold text-gray-900">{vendor.preparationTime} min</p>
          </div>
        </div>
      </section>

      {/* Verification Status */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Verification & Approval</h3>
        {verificationError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {verificationError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <p className="font-medium text-gray-900">Verification Status</p>
            </div>
            <p className={`text-lg font-semibold mb-4 ${
              vendor.verification === 'verified' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {vendor.verification.charAt(0).toUpperCase() + vendor.verification.slice(1)}
            </p>
            {vendor.verifiedAt && (
              <p className="text-sm text-gray-500 mb-4">
                Verified on: {new Date(vendor.verifiedAt).toLocaleDateString()}
              </p>
            )}
            {vendor.verification === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerify('verify')}
                  disabled={verifying}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm transition-colors"
                >
                  ✓ Verify
                </button>
                <button
                  onClick={() => handleVerify('reject')}
                  disabled={verifying}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium text-sm transition-colors"
                >
                  ✗ Reject
                </button>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-blue-600" size={20} />
              <p className="font-medium text-gray-900">Approval Status</p>
            </div>
            <p className={`text-lg font-semibold ${
              vendor.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
            </p>
            {vendor.approvedAt && (
              <p className="text-sm text-gray-500 mt-4">
                Approved on: {new Date(vendor.approvedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
