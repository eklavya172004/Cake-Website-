"use client";
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

// Mock data (Same as Marketplace for now, ideally this should be in a shared file or fetched)
const categories = [
  'Cakes', 'Theme Cakes', 'By Relationship', 'Desserts', 'Birthday', 'Hampers', 'Anniversary', 'Occasions', 'Customized Cakes'
];

interface CakeType {
  id: string;
  slug: string;
  vendorId: string;
  name: string;
  basePrice: number;
  price?: number;
  category: string;
  popularity: number;
  images?: string[];
  vendor?: { id: string; name: string; slug: string };
  vendorName?: string;
}

export default function AllCakesPage() {
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cakes, setCakes] = useState<CakeType[]>([]);

  // Fetch cakes from database
  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const response = await fetch('/api/cakes');
        if (response.ok) {
          const data = await response.json();
          setCakes(data.map((cake: CakeType) => ({
            ...cake,
            vendorName: cake.vendor?.name || 'Unknown Vendor',
            price: cake.basePrice,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch cakes:', error);
      }
    };
    fetchCakes();
  }, []);

  const filteredCakes = cakes
    .filter(cake => {
      const matchesSearch = cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cake.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || cake.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      return 0;
    });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pt-32">
      <div className="pt-40 px-4 container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">All Cakes</h1>
          <p className="text-lg text-gray-600">Explore our complete collection of artisanal confections.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-pink-600 transition-colors" />
            <input
              type="text"
              placeholder="Search for cakes, vendors, or occasions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-300 rounded-lg focus:border-pink-600 focus:outline-none text-lg transition-colors placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-lg border-2 transition-all duration-300 font-semibold ${
              selectedCategory === 'all'
                ? 'bg-pink-600 text-white border-pink-600 shadow-md'
                : 'border-gray-300 text-gray-700 hover:border-pink-600 hover:text-pink-600'
            }`}
          >
            All Cakes
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === selectedCategory ? 'all' : category)}
              className={`px-6 py-2 rounded-lg border-2 transition-all duration-300 font-semibold ${
                selectedCategory === category
                  ? 'bg-pink-600 text-white border-pink-600 shadow-md'
                  : 'border-gray-300 text-gray-700 hover:border-pink-600 hover:text-pink-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y-2 border-gray-200 py-6 mb-12">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-700">Sort by:</span>
            <button
              onClick={() => setSortBy('popularity')}
              className={`text-sm font-semibold transition-colors ${
                sortBy === 'popularity' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Popularity
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`text-sm font-semibold transition-colors ${
                sortBy === 'price' ? 'text-pink-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Price
            </button>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Showing {filteredCakes.length} results
          </div>
        </div>

        {/* Cakes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {filteredCakes.map((cake) => (
            <Link
              key={cake.id}
              href={`/cakes/${cake.vendorId}/${cake.slug}`}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden h-full flex flex-col">
                {/* Cake Image */}
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                    {cake.images && cake.images[0] ? <img src={cake.images[0]} alt={cake.name} className="w-full h-full object-cover" /> : '🎂'}
                  </div>
                  <div className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 text-xs font-bold rounded-lg shadow-sm">
                    {cake.category}
                  </div>
                </div>

                {/* Cake Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">{cake.name}</h3>
                  <p className="text-xs text-gray-600 font-medium mb-4">{cake.vendorName}</p>
                  
                  {/* Price */}
                  <div className="mb-4 mt-auto">
                    <span className="text-2xl font-bold text-gray-900">₹{cake.price}</span>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-all duration-300 text-sm shadow-sm hover:shadow-md">
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
