'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  popularity: number;
  rating?: number;
  status: 'active' | 'inactive';
}

interface Cake {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  description?: string;
  images: string[];
  flavors: string[];
  customOptions?: {
    toppings: string[];
  };
  isActive: boolean;
  isCustomizable: boolean;
  availableSizes: any[];
}

interface VerificationStatus {
  status: string;
}

export default function VendorProducts() {
  const router = useRouter();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await fetch('/api/vendor/approval-status', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Products page - Approval status:', data);
          setVerificationStatus(data.status || 'pending');
        } else {
          console.warn('Failed to fetch approval status:', response.status);
          setVerificationStatus('pending');
        }
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setVerificationStatus('pending');
      } finally {
        setCheckingStatus(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const response = await fetch('/api/vendor/cakes', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch cakes');
        const result = await response.json();
        setCakes(result || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (!checkingStatus) {
      fetchCakes();
    }
  }, [checkingStatus]);

  const isApproved = verificationStatus.toLowerCase() === 'approved';

  const handleDeleteCake = async (cakeId: string) => {
    if (!window.confirm('Are you sure you want to delete this cake? This action cannot be undone.')) {
      return;
    }

    setDeletingId(cakeId);
    try {
      const response = await fetch(`/api/vendor/cakes/${cakeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCakes(cakes.filter((cake) => cake.id !== cakeId));
      } else {
        const data = await response.json();
        alert('Error deleting cake: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error deleting cake: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  if (checkingStatus || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sell Cakes</h1>
          <p className="text-gray-600 mt-1">Manage your cake catalog</p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sell Cakes</h1>
          <p className="text-gray-600 mt-1">Manage your cake catalog</p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-yellow-900">Verification Required</h3>
              <p className="text-yellow-800 mt-2">
                Your profile needs to be verified by our admin team before you can start selling cakes. 
                {verificationStatus.toLowerCase() === 'pending' && ' Your application is currently under review.'}
                {verificationStatus.toLowerCase() === 'rejected' && ' Your application was rejected. Please update your profile and resubmit.'}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => router.push('/vendor/profile')}
                  className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
                >
                  View Profile
                </button>
                {verificationStatus.toLowerCase() === 'rejected' && (
                  <button
                    onClick={() => router.push('/vendor/onboarding/status')}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Update & Resubmit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sell Cakes</h1>
          <p className="text-gray-600 mt-1">Manage your cake catalog</p>
          {isApproved && (
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 font-semibold">
                Your profile is verified - Ready to sell
              </span>
            </div>
          )}
        </div>
        {isApproved && (
          <Link href="/vendor/cakes/upload">
            <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition shadow-md hover:shadow-lg">
              <Plus size={18} /> Add Cake
            </button>
          </Link>
        )}
      </div>

      {cakes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No cakes added yet</p>
          <p className="text-gray-400 mt-1">Start by adding your first cake to your catalog</p>
          {isApproved && (
            <Link href="/vendor/cakes/upload">
              <button className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition mx-auto">
                <Plus size={18} /> Add Your First Cake
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cakes.map((cake) => (
            <div key={cake.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
              {/* Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden group">
                {cake.images && cake.images.length > 0 ? (
                  <img
                    src={cake.images[0]}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      cake.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {cake.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 line-clamp-2">{cake.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{cake.category}</p>
                </div>

                {/* Description */}
                {cake.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{cake.description}</p>
                )}

                {/* Price */}
                <div className="border-t pt-3">
                  <p className="text-lg font-bold text-gray-900">₹{cake.basePrice}</p>
                </div>

                {/* Details */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Flavors:</span>{' '}
                    {cake.flavors?.slice(0, 2).join(', ') || 'N/A'}
                    {cake.flavors && cake.flavors.length > 2 && ` +${cake.flavors.length - 2}`}
                  </p>
                  <p>
                    <span className="font-semibold">Toppings:</span>{' '}
                    {cake.customOptions?.toppings?.slice(0, 2).join(', ') || 'N/A'}
                    {cake.customOptions?.toppings && cake.customOptions.toppings.length > 2 && ` +${cake.customOptions.toppings.length - 2}`}
                  </p>
                  <p>
                    <span className="font-semibold">Images:</span> {cake.images?.length || 0}/4
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Link href={`/vendor/cakes/${cake.id}/edit`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition">
                      <Edit2 size={14} /> Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteCake(cake.id)}
                    disabled={deletingId === cake.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} /> {deletingId === cake.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cakes.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">{cakes.length}</span> cake{cakes.length !== 1 ? 's' : ''} uploaded. You can upload more anytime!
          </p>
        </div>
      )}
    </div>
  );
}
