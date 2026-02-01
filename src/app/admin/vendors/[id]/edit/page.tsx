'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface VendorData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  minOrderAmount: number;
  preparationTime: number;
  isActive: boolean;
}

export default function EditVendorPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<VendorData>>({});

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await fetch(`/api/admin/vendors/${vendorId}`);
        if (!response.ok) throw new Error('Failed to fetch vendor');
        const data = await response.json();
        setVendor(data);
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description,
          minOrderAmount: data.minOrderAmount,
          preparationTime: data.preparationTime,
          isActive: data.isActive,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchVendor();
    }
  }, [vendorId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update vendor');
      router.push(`/admin/vendors/${vendorId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !vendor) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <h1 className="text-4xl font-bold text-gray-900">Edit Vendor</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Vendor Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Enter vendor name"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Slug <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug || ''}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              placeholder="Enter vendor slug"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 h-32 resize-none"
              placeholder="Enter vendor description"
            />
          </div>

          {/* Minimum Order Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Minimum Order Amount (₹) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount || ''}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="0.00"
              />
            </div>

            {/* Preparation Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Preparation Time (minutes) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime || ''}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="0"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive || false}
              onChange={handleInputChange}
              className="w-5 h-5 border border-gray-300 rounded focus:outline-none"
            />
            <label className="text-sm font-semibold text-gray-900">
              Active Status
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
