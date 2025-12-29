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
    <div className="min-h-screen bg-[#FFF9EB] text-[#1a1a1a] font-sans">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-6 bg-[#FFF9EB]/90 backdrop-blur-md border-b border-[#1a1a1a]/10">
        <Link href="/" className="text-2xl font-bold tracking-tighter cursor-pointer">SAVOR</Link>
        <div className="hidden md:flex space-x-10 text-[10px] uppercase tracking-widest font-bold">
          <Link href="/" className="hover:opacity-50">Home</Link>
          <Link href="/cakes" className="opacity-50 cursor-default">Cakes</Link>
        </div>
        <button className="bg-[#1a1a1a] text-[#F7E47D] px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest">Cart (0)</button>
      </nav>

      <div className="pt-32 px-4 container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="serif text-5xl md:text-7xl mb-6">All Cakes</h1>
          <p className="text-xl text-gray-600 font-light">Explore our complete collection of artisanal confections.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#1a1a1a] transition-colors" />
            <input
              type="text"
              placeholder="Search for cakes, vendors, or occasions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent border-b-2 border-gray-200 focus:border-[#1a1a1a] focus:outline-none text-lg transition-colors placeholder:font-light"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === selectedCategory ? 'all' : category)}
              className={`px-6 py-2 rounded-full border transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#1a1a1a] text-[#F7E47D] border-[#1a1a1a]'
                  : 'border-gray-300 hover:border-[#1a1a1a] text-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-gray-200 py-4 mb-12">
          <div className="flex items-center gap-4">
            <span className="font-serif italic text-gray-500">Sort by:</span>
            <button
              onClick={() => setSortBy('popularity')}
              className={`text-sm uppercase tracking-widest font-bold transition-colors ${
                sortBy === 'popularity' ? 'text-[#1a1a1a]' : 'text-gray-400 hover:text-[#1a1a1a]'
              }`}
            >
              Popularity
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`text-sm uppercase tracking-widest font-bold transition-colors ${
                sortBy === 'price' ? 'text-[#1a1a1a]' : 'text-gray-400 hover:text-[#1a1a1a]'
              }`}
            >
              Price
            </button>
          </div>
          <div className="text-sm text-gray-500 font-light">
            Showing {filteredCakes.length} results
          </div>
        </div>

        {/* Cakes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {filteredCakes.map((cake) => (
            <div
              key={cake.id}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
                  {cake.images && cake.images[0] ? <img src={cake.images[0]} alt={cake.name} className="w-full h-full object-cover" /> : '🎂'}
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-widest">
                  {cake.category}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="serif text-2xl mb-1 group-hover:underline decoration-1 underline-offset-4">{cake.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{cake.vendorName}</p>
                </div>
                <span className="serif text-xl">₹{cake.price}</span>
              </div>
              <Link href={`/cakes/${cake.vendorId}/${cake.slug}`} className="block mt-4 w-full py-3 border border-[#1a1a1a] text-center text-xs uppercase tracking-widest font-bold hover:bg-[#1a1a1a] hover:text-[#F7E47D] transition-colors">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
