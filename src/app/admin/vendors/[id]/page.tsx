'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  AlertCircle,
  Star,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import VendorDetailsCard from '@/components/admin/VendorDetailsCard';
import ProductsTab from '@/components/admin/ProductsTab';
import OrdersTab from '@/components/admin/OrdersTab';

interface VendorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalReviews: number;
  minOrderAmount: number;
  preparationTime: number;
  isActive: boolean;
  status: string;
  verification: string;
  verifiedAt?: string;
  approvedAt?: string;
  profile?: {
    businessName: string;
    businessType: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail: string;
    gstNumber?: string;
    panNumber?: string;
  };
  serviceAreas?: Array<{
    location: string;
    pincodes: string[];
  }>;
  products: {
    total: number;
    active: number;
    inactive: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
}

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'products' | 'orders'>('details');
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/vendors/${vendorId}`);
        if (!response.ok) throw new Error('Failed to fetch vendor');
        const data = await response.json();
        setVendor(data);
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

  const handleToggleStatus = async () => {
    if (!vendor) return;
    setToggling(true);

    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !vendor.isActive }),
      });

      if (!response.ok) throw new Error('Failed to update vendor status');
      const updated = await response.json();
      setVendor(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!vendor || !confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete vendor');
      router.push('/admin/vendors');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setDeleting(false);
    }
  };

  const handleVerificationUpdate = (verification: string) => {
    if (vendor) {
      setVendor({ ...vendor, verification });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="space-y-6">
        <Link href="/admin/vendors" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} />
          Back to Vendors
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{error || 'Vendor not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/vendors" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft size={20} />
            Back
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-600 mt-2">Vendor ID: {vendor.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/admin/vendors/${vendorId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit size={18} />
            Edit Vendor
          </button>
          <button 
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 font-medium transition-colors ${
              vendor.isActive
                ? 'bg-orange-600 hover:bg-orange-700 disabled:opacity-50'
                : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
            }`}
          >
            {vendor.isActive ? 'Make Inactive' : 'Make Active'}
          </button>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
          >
            Delete Vendor
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex gap-2">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            vendor.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {vendor.isActive ? 'Active' : 'Inactive'}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            vendor.status === 'approved'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {vendor.status}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            vendor.verification === 'verified'
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {vendor.verification}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{vendor.orders.total}</p>
            </div>
            <ShoppingCart className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{vendor.products.active}</p>
            </div>
            <Package className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Revenue (This Month)</p>
              <p className="text-2xl font-bold text-gray-900">₹{vendor.revenue.thisMonth.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">{vendor.rating.toFixed(1)}</p>
                <Star className="text-yellow-500" size={20} fill="currentColor" />
              </div>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-4 font-medium border-b-2 ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-4 font-medium border-b-2 ${
              activeTab === 'products'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Products ({vendor.products.total})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-medium border-b-2 ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Orders ({vendor.orders.total})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'details' && <VendorDetailsCard vendor={vendor} onVerificationUpdate={handleVerificationUpdate} />}
          {activeTab === 'products' && <ProductsTab vendorId={vendorId} />}
          {activeTab === 'orders' && <OrdersTab vendorId={vendorId} />}
        </div>
      </div>
    </div>
  );
}
