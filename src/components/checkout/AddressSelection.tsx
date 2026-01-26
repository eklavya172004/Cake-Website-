'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus } from 'lucide-react';

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

interface AddressSelectionProps {
  onAddressSelect: (address: Address) => void;
  selectedAddress: Address | null;
  onAddNewAddress?: () => void;
}

export default function AddressSelection({ onAddressSelect, selectedAddress, onAddNewAddress }: AddressSelectionProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/addresses', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const loadedAddresses = data.addresses || [];
        console.log('Loaded addresses:', loadedAddresses);
        setAddresses(loadedAddresses);

        // Auto-select default address if no address is selected
        if (!selectedAddress && loadedAddresses.length > 0) {
          const defaultAddr = loadedAddresses.find((a: Address) => a.isDefault);
          if (defaultAddr) {
            console.log('Auto-selecting default address:', defaultAddr);
            onAddressSelect(defaultAddr);
            setUseNewAddress(false);
            setShowSaved(true);
          } else {
            // If no default, select the first address
            console.log('No default address, auto-selecting first address');
            onAddressSelect(loadedAddresses[0]);
            setUseNewAddress(false);
            setShowSaved(true);
          }
        }
      } else {
        console.error('Failed to fetch addresses:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowSaved(!showSaved)}
            className="w-full flex items-center justify-between p-4 bg-linear-to-r from-pink-50 to-orange-50 border-2 border-pink-200 rounded-lg hover:border-pink-400 transition-colors mb-4"
          >
            <span className="flex items-center gap-2 font-semibold text-gray-900">
              <MapPin className="w-5 h-5 text-pink-600" />
              Use Saved Address
            </span>
            <span className={`text-gray-600 transition-transform ${showSaved ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showSaved && (
            <div className="space-y-3 mb-6">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => {
                    onAddressSelect(address);
                    setUseNewAddress(false);
                  }}
                  className={`w-full p-4 rounded-lg border-2 cursor-pointer transition-all text-left ${
                    selectedAddress?.id === address.id && !useNewAddress
                      ? 'bg-pink-50 border-pink-600 ring-2 ring-pink-300'
                      : 'bg-white border-gray-300 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {address.label}
                        {address.isDefault && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.pincode}
                      </p>
                      <p className="text-sm text-gray-600 font-semibold mt-2">{address.phone}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedAddress?.id === address.id && !useNewAddress
                        ? 'border-pink-600 bg-pink-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedAddress?.id === address.id && !useNewAddress && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {addresses.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            No saved addresses yet. Add your first address below.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (!useNewAddress) {
            // When clicking "Add New Address", call the callback to notify parent
            onAddNewAddress?.();
          }
          setUseNewAddress(!useNewAddress);
          setShowSaved(false);
        }}
        className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all ${
          useNewAddress
            ? 'bg-pink-50 border-pink-400 text-pink-600'
            : 'border-gray-300 text-gray-600 hover:border-pink-300 hover:text-pink-600'
        }`}
      >
        <Plus className="w-5 h-5" />
        {useNewAddress ? 'Use Saved Address' : 'Add New Address'}
      </button>

      {useNewAddress && selectedAddress && !selectedAddress.id && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ✓ You&apos;ve selected to enter a new delivery address. Fill in the address details below to continue.
          </p>
        </div>
      )}
    </div>
  );
}
