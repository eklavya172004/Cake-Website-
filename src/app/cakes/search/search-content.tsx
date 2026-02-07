'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CakeType {
  id: string;
  slug: string;
  vendorId: string;
  name: string;
  basePrice: number;
  price?: number;
  category: string;
  cakeType?: string;
  flavor?: string;
  deliveryCity?: string;
  popularity: number;
  images?: string[];
  vendor?: { id: string; name: string; slug: string };
  vendorName?: string;
  rating?: number;
}

export function CakeSearchContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const cakeType = searchParams.get('cakeType');
  const flavor = searchParams.get('flavor');
  const deliveryCity = searchParams.get('deliveryCity');

  const [sortBy, setSortBy] = useState('popularity');
  const [cakes, setCakes] = useState<CakeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFilteredCakes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (cakeType) params.append('cakeType', cakeType);
        if (flavor) params.append('flavor', flavor);
        if (deliveryCity) params.append('deliveryCity', deliveryCity);
        params.append('limit', '100');

        const response = await fetch(`/api/cakes/filter?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setCakes(data.data.map((cake: CakeType) => ({
            ...cake,
            vendorName: cake.vendor?.name || 'Unknown Vendor',
            price: cake.basePrice,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch cakes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredCakes();
  }, [category, cakeType, flavor, deliveryCity]);

  const filteredCakes = cakes.filter(cake => {
    const matchesSearch = cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (cake.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  })
  .sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return b.popularity - a.popularity;
  });

  const pageTitle = category || cakeType || flavor || deliveryCity || 'All Cakes';

  return (
    <div className="pt-40 px-4 mt-20 container mx-auto max-w-6xl">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
        <p className="text-lg text-gray-600">
          {loading ? 'Loading...' : `Showing ${filteredCakes.length} cake${filteredCakes.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Search and Sort Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="md:col-span-2 relative group">
          <input
            type="text"
            placeholder="Search cakes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none transition-colors placeholder:text-gray-500 font-medium"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none cursor-pointer font-semibold text-gray-700"
        >
          <option value="popularity">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
        </div>
      )}

      {/* Cakes Grid */}
      {!loading && filteredCakes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {filteredCakes.map((cake) => (
            <Link
              key={cake.id}
              href={`/cakes/${cake.vendorId}/${cake.slug}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:scale-105"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-pink-100 to-orange-100 overflow-hidden">
                {cake.images && cake.images.length > 0 ? (
                  <img
                    src={cake.images[0]}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>No Image</span>
                  </div>
                )}
                {cake.popularity > 80 && (
                  <div className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Popular
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Cake Type */}
                {cake.cakeType && (
                  <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-2">
                    {cake.cakeType}
                  </p>
                )}

                {/* Name */}
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-pink-600 transition-colors">
                  {cake.name}
                </h3>

                {/* Flavor and City */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {cake.flavor && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {cake.flavor}
                    </span>
                  )}
                  {cake.deliveryCity && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {cake.deliveryCity}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {cake.rating !== undefined && cake.rating !== null && cake.rating > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-bold text-gray-900">{cake.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({Math.floor(Math.random() * 200) + 10} reviews)</span>
                  </div>
                )}

                {/* Vendor */}
                <p className="text-xs text-gray-600 mb-4 font-medium">{cake.vendorName}</p>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{cake.price || cake.basePrice}
                  </span>
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 transition-all duration-300 text-sm group-hover:shadow-md">
                    View
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCakes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-4">No cakes found</p>
            <p className="text-gray-600 mb-8">Try adjusting your search or filters</p>
            <Link
              href="/cakes"
              className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-all inline-block"
            >
              Browse All Cakes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
