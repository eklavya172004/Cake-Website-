'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  category: string;
  flavor?: string;
  images: string[];
  isActive: boolean;
  isCustomizable: boolean;
  availableSizes?: any[];
}

interface EditProductModalProps {
  vendorId: string;
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({
  vendorId,
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    basePrice: product.basePrice.toString(),
    category: product.category,
    flavor: product.flavor || '',
    images: product.images || [],
    isCustomizable: product.isCustomizable,
    isActive: product.isActive,
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.basePrice) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/vendors/${vendorId}/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cakeId: product.id,
          name: formData.name,
          description: formData.description,
          basePrice: parseFloat(formData.basePrice),
          category: formData.category,
          flavor: formData.flavor,
          images: formData.images,
          isCustomizable: formData.isCustomizable,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update product');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price *
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Cakes</option>
                <option>Theme Cakes</option>
                <option>Desserts</option>
                <option>Birthday</option>
                <option>Hampers</option>
                <option>Anniversary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flavor
              </label>
              <input
                type="text"
                name="flavor"
                value={formData.flavor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="customizable"
                name="isCustomizable"
                checked={formData.isCustomizable}
                onChange={handleChange}
                className="rounded"
              />
              <label htmlFor="customizable" className="text-sm font-medium text-gray-700">
                This product is customizable
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Product is active
              </label>
            </div>
          </div>

          {/* Image URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="space-y-2 mb-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600 truncate">{img}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
