'use client';

import { useEffect, useState } from 'react';
import { Trash2, Edit, Plus, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';

interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  category: string;
  flavor?: string;
  images: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  popularity: number;
  isCustomizable: boolean;
  createdAt: string;
}

interface ProductsTabProps {
  vendorId: string;
}

export default function ProductsTab({ vendorId }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const statusParam = status !== 'all' ? `&status=${status}` : '';
      const response = await fetch(
        `/api/admin/vendors/${vendorId}/products?page=${page}&limit=10${statusParam}`
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.cakes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchProducts();
    }
  }, [vendorId, page, status]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(
        `/api/admin/vendors/${vendorId}/products?cakeId=${productId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete product');

      setProducts(products.filter((p) => p.id !== productId));
      alert('Product deleted successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/products`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cakeId: productId,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update product');

      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, isActive: !currentStatus } : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              status === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatus('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              status === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatus('inactive')}
            className={`px-4 py-2 rounded-lg font-medium ${
              status === 'inactive'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Inactive
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-600">
                        Category: <span className="font-medium text-gray-900">{product.category}</span>
                      </span>
                      <span className="text-gray-600">
                        Price: <span className="font-medium text-gray-900">₹{product.basePrice}</span>
                      </span>
                      <span className="text-gray-600">
                        Rating: <span className="font-medium text-gray-900">{product.rating.toFixed(1)}</span>
                      </span>
                      <span className="text-gray-600">
                        Reviews: <span className="font-medium text-gray-900">{product.reviewCount}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(product.id, product.isActive)}
                      className="px-3 py-1 text-sm font-medium rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200"
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>

                {/* Expandable Details */}
                {expandedProduct === product.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Flavor</p>
                      <p className="text-gray-900">{product.flavor || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customizable</p>
                      <p className="text-gray-900">{product.isCustomizable ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddProductModal
          vendorId={vendorId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchProducts();
            setShowAddModal(false);
          }}
        />
      )}

      {editingProduct && (
        <EditProductModal
          vendorId={vendorId}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            fetchProducts();
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
