'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import CakeEditForm from '@/components/vendor/CakeEditForm';

interface Cake {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  flavors: string[];
  customOptions: {
    toppings: string[];
  };
  availableSizes: { size: string; price: number }[];
  isCustomizable: boolean;
  images: string[];
  isActive: boolean;
}

export default function EditCakePage() {
  const router = useRouter();
  const params = useParams();
  const cakeId = params?.id as string;

  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCake = async () => {
      if (!cakeId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/vendor/cakes/${cakeId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch cake');
        }

        const cakeData = await response.json();
        setCake(cakeData);
      } catch (err) {
        console.error('Error fetching cake:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCake();
  }, [cakeId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Cake</h1>
          <p className="text-gray-600 mt-1">Loading cake details...</p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Cake</h1>
          <p className="text-gray-600 mt-1">Unable to load cake details</p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900">Error Loading Cake</h3>
              <p className="text-red-800 mt-2">{error}</p>
              <button
                onClick={() => router.push('/vendor/products')}
                className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Cake</h1>
          <p className="text-gray-600 mt-1">Cake not found</p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-yellow-900">Cake Not Found</h3>
              <p className="text-yellow-800 mt-2">The cake you&apos;re trying to edit could not be found.</p>
              <button
                onClick={() => router.push('/vendor/products')}
                className="mt-4 px-6 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Cake</h1>
        <p className="text-gray-600 mt-1">Update your cake details</p>
      </div>

      <CakeEditForm cake={cake} onSuccess={() => router.push('/vendor/products')} />
    </div>
  );
}
