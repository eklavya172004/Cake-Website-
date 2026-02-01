import {
  User,
  Phone,
  Mail,
  Building,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface VendorDetailsProps {
  vendor: {
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
}

export default function VendorDetailsCard({ vendor }: VendorDetailsProps) {
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
              <p className="text-lg font-medium text-gray-900">{vendor.email}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <p className="font-medium text-gray-900">Verification Status</p>
            </div>
            <p className="text-gray-600">{vendor.verification}</p>
            {vendor.verifiedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Verified on: {new Date(vendor.verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-blue-600" size={20} />
              <p className="font-medium text-gray-900">Approval Status</p>
            </div>
            <p className="text-gray-600">{vendor.status}</p>
            {vendor.approvedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Approved on: {new Date(vendor.approvedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
