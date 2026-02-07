'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import OnboardingStatusPage from './status/page';

interface OnboardingData {
  // Business Information
  businessName: string;
  businessType: string;
  businessRegistration: string;
  gstNumber: string;
  panNumber: string;

  // Owner Information
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;

  // Shop Contact Details (for customers)
  shopPhone: string;
  shopEmail: string;
  shopAddress: string;

  // Bank Details
  bankAccountNumber: string;
  bankIfscCode: string;
  bankAccountHolderName: string;

  // Service Areas
  serviceAreas: Array<{
    location: string;
    pincodes: string;
    deliveryFee: number;
    operatingHours: {
      start: string;
      end: string;
    };
  }>;
}

export default function VendorOnboarding() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasSubmittedOnboarding, setHasSubmittedOnboarding] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const [formData, setFormData] = useState<OnboardingData>({
    businessName: '',
    businessType: 'Sole Proprietor',
    businessRegistration: '',
    gstNumber: '',
    panNumber: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    shopPhone: '',
    shopEmail: '',
    shopAddress: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankAccountHolderName: '',
    serviceAreas: [
      {
        location: '',
        pincodes: '',
        deliveryFee: 0,
        operatingHours: { start: '08:00', end: '22:00' },
      },
    ],
  });

  // Check if vendor has already submitted onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/vendor/onboarding/status', {
          credentials: 'include',
        });

        const data = await response.json();
        
        // Check if the vendor has completed onboarding
        if (data.submittedStatus === true) {
          setHasSubmittedOnboarding(true);
        } else {
          setHasSubmittedOnboarding(false);
        }
      } catch (error) {
        // If error, vendor hasn't submitted yet
        console.error('Error checking onboarding status:', error);
        setHasSubmittedOnboarding(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (session?.user) {
      checkOnboardingStatus();
    }
  }, [session]);

  // If vendor has submitted, show status page
  if (!checkingStatus && hasSubmittedOnboarding) {
    return <OnboardingStatusPage />;
  }

  // If still checking, show loading
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-6 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    areaIndex?: number
  ) => {
    const { name, value } = e.target;

    if (areaIndex !== undefined) {
      const updatedAreas = [...formData.serviceAreas];
      if (name === 'location' || name === 'pincodes') {
        updatedAreas[areaIndex] = { ...updatedAreas[areaIndex], [name]: value };
      } else if (name === 'deliveryFee') {
        updatedAreas[areaIndex] = { ...updatedAreas[areaIndex], deliveryFee: parseFloat(value) || 0 };
      } else if (name === 'startTime') {
        updatedAreas[areaIndex].operatingHours.start = value;
      } else if (name === 'endTime') {
        updatedAreas[areaIndex].operatingHours.end = value;
      }
      setFormData({ ...formData, serviceAreas: updatedAreas });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addServiceArea = () => {
    setFormData({
      ...formData,
      serviceAreas: [
        ...formData.serviceAreas,
        {
          location: '',
          pincodes: '',
          deliveryFee: 0,
          operatingHours: { start: '08:00', end: '22:00' },
        },
      ],
    });
  };

  const removeServiceArea = (index: number) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter((_, i) => i !== index),
    });
  };

  const validateStep = (currentStep: number) => {
    setError('');

    if (currentStep === 1) {
      if (!formData.businessName || !formData.businessRegistration) {
        setError('Business name and registration number are required');
        return false;
      }
      if (!formData.gstNumber || formData.gstNumber.length !== 15) {
        setError('GST number is required and must be 15 characters');
        return false;
      }
      if (!formData.panNumber || formData.panNumber.length !== 10) {
        setError('PAN number is required and must be 10 characters');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.ownerName || !formData.ownerPhone || !formData.ownerEmail) {
        setError('All owner details are required');
        return false;
      }
      if (!/^\d{10}$/.test(formData.ownerPhone)) {
        setError('Phone number must be 10 digits');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
        setError('Invalid email address');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.shopPhone || !formData.shopEmail || !formData.shopAddress) {
        setError('All shop contact details are required');
        return false;
      }
      if (!/^\d{10}$/.test(formData.shopPhone)) {
        setError('Shop phone number must be 10 digits');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shopEmail)) {
        setError('Invalid shop email address');
        return false;
      }
      if (formData.shopAddress.trim().length < 10) {
        setError('Please provide a complete shop address');
        return false;
      }
    }

    if (currentStep === 4) {
      if (!formData.bankAccountNumber || !formData.bankIfscCode || !formData.bankAccountHolderName) {
        setError('All bank details are required');
        return false;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankIfscCode)) {
        setError('Invalid IFSC code format');
        return false;
      }
    }

    if (currentStep === 5) {
      if (
        formData.serviceAreas.some((area) => !area.location || !area.pincodes)
      ) {
        setError('All service area details are required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    if (step < 5) {
      setStep(step + 1);
      return;
    }

    // Submit all data
    setLoading(true);
    setError('');

    try {
      const formDataMultipart = new FormData();
      let vendorId = (session?.user as { vendorId?: string })?.vendorId || '';
      const accountEmail = (session?.user as { email?: string })?.email || '';
      
      // Get the password from sessionStorage (stored during signup)
      const accountPassword = typeof window !== 'undefined' ? sessionStorage.getItem('signupPassword') : null;
      
      // If no vendorId exists, create one
      if (!vendorId) {
        console.log('No vendorId in session, generating one...');
        vendorId = `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      formDataMultipart.append('sessionVendorId', vendorId);
      formDataMultipart.append('accountEmail', accountEmail);
      if (accountPassword) {
        formDataMultipart.append('accountPassword', accountPassword);
      }
      formDataMultipart.append('data', JSON.stringify(formData));

      const response = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        body: formDataMultipart,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit onboarding');
      }

      // Refresh session to pick up the updated vendorId from database
      console.log('Refreshing session after onboarding submission...');
      await update();

      setSuccess(true);
      setTimeout(() => {
        router.push('/vendor/onboarding/status');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const progressSteps = [
    'Business Info',
    'Owner Details',
    'Shop Contact',
    'Bank Account',
    'Service Areas',
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white p-6 pt-20">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Onboarding</h1>
          <p className="text-gray-600 mt-2">Complete your profile to start selling</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((stepName, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${
                    index + 1 < step
                      ? 'bg-pink-600 text-white'
                      : index + 1 === step
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1 < step ? '✓' : index + 1}
                </div>
                {index < progressSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index + 1 < step ? 'bg-pink-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {step} of {progressSteps.length}: {progressSteps[step - 1]}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-green-700">Onboarding submitted successfully! Redirecting...</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Business Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Your bakery/shop name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                >
                  <option value="Sole Proprietor">Sole Proprietor</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Company">Company</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Registration Number *
                </label>
                <input
                  type="text"
                  name="businessRegistration"
                  value={formData.businessRegistration}
                  onChange={handleInputChange}
                  placeholder="e.g., REG123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GST Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="15-digit GST"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Required • Must be 15 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="10-digit PAN"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Required • Must be 10 characters</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Owner Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Owner Details</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  placeholder="owner@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Step 2.5: Shop Contact Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Shop Contact Details</h2>
              <p className="text-gray-600 text-sm">
                How customers can reach your shop. These details will be displayed publicly.
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shop Phone Number *
                </label>
                <input
                  type="tel"
                  name="shopPhone"
                  value={formData.shopPhone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shop Email Address *
                </label>
                <input
                  type="email"
                  name="shopEmail"
                  value={formData.shopEmail}
                  onChange={handleInputChange}
                  placeholder="shop@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shop Address *
                </label>
                <textarea
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleInputChange}
                  placeholder="Full address where customers can visit"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Bank Account */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Bank Account Details</h2>
              <p className="text-gray-600 text-sm">
                These details are used for secure payouts. Your information is encrypted and secure.
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Your bank account number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  name="bankIfscCode"
                  value={formData.bankIfscCode}
                  onChange={handleInputChange}
                  placeholder="e.g., HDFC0001234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  name="bankAccountHolderName"
                  value={formData.bankAccountHolderName}
                  onChange={handleInputChange}
                  placeholder="Name on bank account"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Step 4: Service Areas */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Service Areas</h2>
              <p className="text-gray-600 text-sm">
                Define where you deliver and your operating hours for each location.
              </p>

              {formData.serviceAreas.map((area, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 border border-gray-200 relative"
                >
                  {formData.serviceAreas.length > 1 && (
                    <button
                      onClick={() => removeServiceArea(index)}
                      title="Remove this service area"
                      className="absolute top-3 right-3 p-1 hover:bg-red-100 rounded transition"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Location {index + 1}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location Name *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={area.location}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="e.g., Main Branch"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Service Pincodes (comma-separated) *
                      </label>
                      <input
                        type="text"
                        name="pincodes"
                        value={area.pincodes}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="e.g., 110001, 110002, 110003"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Fee (₹)
                      </label>
                      <input
                        type="number"
                        name="deliveryFee"
                        value={area.deliveryFee}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`openingTime-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">
                          Opening Time
                        </label>
                        <input
                          id={`openingTime-${index}`}
                          type="time"
                          name="startTime"
                          value={area.operatingHours.start}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                        />
                      </div>

                      <div>
                        <label htmlFor={`closingTime-${index}`} className="block text-sm font-semibold text-gray-700 mb-2">
                          Closing Time
                        </label>
                        <input
                          id={`closingTime-${index}`}
                          type="time"
                          name="endTime"
                          value={area.operatingHours.end}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addServiceArea}
                className="w-full py-2 px-4 border-2 border-dashed border-pink-300 text-pink-600 font-semibold rounded-lg hover:bg-pink-50 transition"
              >
                + Add Another Location
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg text-white transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              {loading ? 'Processing...' : step === 5 ? 'Submit & Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
