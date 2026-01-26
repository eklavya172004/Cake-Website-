'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Phone, AlertCircle, Check } from 'lucide-react';

interface Address {
  id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

interface AddressManagerProps {
  user: { id: string; email: string };
  onAddressUpdate: () => void;
}

export default function AddressManager({ user, onAddressUpdate }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Address>({
    label: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      isDefault: false
    });
    setEditingId(null);
    setIsAddingNew(false);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.label || !formData.street || !formData.city || !formData.pincode || !formData.phone) {
        throw new Error('Please fill all required fields');
      }

      if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
        throw new Error('Phone number must be valid (10 digits)');
      }

      if (!/^[0-9]{6}$/.test(formData.pincode)) {
        throw new Error('Pincode must be 6 digits');
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `/api/user/addresses/${editingId}`
        : '/api/user/addresses';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save address');
      }

      setSuccess(editingId ? 'Address updated successfully!' : 'Address added successfully!');
      setTimeout(() => {
        loadAddresses();
        onAddressUpdate();
        resetForm();
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      setSuccess('Address deleted successfully!');
      setTimeout(() => {
        loadAddresses();
        onAddressUpdate();
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData(address);
    setEditingId(address.id || null);
    setIsAddingNew(true);
  };

  return (
    <div className="space-y-6">
      {/* Add Address Button */}
      {!isAddingNew && (
        <button
          onClick={() => setIsAddingNew(true)}
          className="w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed border-pink-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all text-pink-600 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </button>
      )}

      {/* Add/Edit Address Form */}
      {isAddingNew && (
        <div className="bg-linear-to-br from-pink-50 to-orange-50 rounded-xl p-6 border border-pink-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>

          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <Check className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Label (e.g., Home, Office) *
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder="e.g., Home"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Street address, building, apartment"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="6-digit pincode"
                pattern="[0-9]{6}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                id="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                Set as default address
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                address.isDefault
                  ? 'bg-pink-50 border-pink-300'
                  : 'bg-white border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900">{address.label}</h4>
                    {address.isDefault && (
                      <span className="inline-block text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-0.5 rounded mt-1">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="px-3 py-1 text-sm text-pink-600 hover:bg-pink-100 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => address.id && handleDelete(address.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    aria-label="Delete address"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="ml-7 space-y-1 text-sm text-gray-600">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {address.phone}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {addresses.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No addresses saved yet</p>
        </div>
      )}
    </div>
  );
}
