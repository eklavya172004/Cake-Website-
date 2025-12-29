"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Search, Clock, Truck, Star, ChevronDown, X, Check, TrendingUp, DollarSign, Award, User } from 'lucide-react';
import Link from 'next/link';

// Mock data
const serviceableAreas = [
  { name: 'North Delhi', pincodes: ['110001', '110006', '110007', '110009'] },
  { name: 'South Delhi', pincodes: ['110016', '110017', '110019', '110024'] },
  { name: 'Gurgaon', pincodes: ['122001', '122002', '122003', '122004'] },
  { name: 'Faridabad', pincodes: ['121001', '121002', '121003', '121004'] },
  { name: 'Ghaziabad', pincodes: ['201001', '201002', '201003', '201004'] },
  { name: 'Noida', pincodes: ['201301', '201303', '201304', '201305'] },
  { name: 'Greater Noida', pincodes: ['201306', '201308', '201310', '203207'] },
];

const vendors = [
  { id: 1, name: 'Sweet Dreams Bakery', rating: 4.8, reviews: 245, areas: ['110001', '110006', '122001'], prepTime: 180, deliveryFee: 50, image: '🎂' },
  { id: 2, name: 'Cake Studio Pro', rating: 4.9, reviews: 189, areas: ['110016', '110017', '201301'], prepTime: 240, deliveryFee: 60, image: '🍰' },
  { id: 3, name: 'Divine Delights', rating: 4.7, reviews: 312, areas: ['122001', '122002', '121001'], prepTime: 150, deliveryFee: 40, image: '🧁' },
  { id: 4, name: 'Heavenly Bakes', rating: 4.9, reviews: 421, areas: ['201001', '201002', '110009'], prepTime: 120, deliveryFee: 45, image: '🎂' },
  { id: 5, name: 'Sugar & Spice', rating: 4.6, reviews: 167, areas: ['201301', '201303', '110024'], prepTime: 200, deliveryFee: 55, image: '🍰' },
  { id: 6, name: 'Cake Magic', rating: 4.8, reviews: 298, areas: ['110001', '121001', '122003'], prepTime: 180, deliveryFee: 50, image: '✨' },
];

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

export default function Marketplace() {
  type UserLocation = { lat?: number; lng?: number; pincode?: string } | null;
  const [showLocationModal, setShowLocationModal] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locationSelected');
      const pincode = localStorage.getItem('userPincode');
      // Only hide if we have both the flag AND a saved pincode
      return (saved && pincode) ? false : true;
    }
    return true;
  });
  const [userPincode, setUserPincode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userPincode') || '';
    }
    return '';
  });
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
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

  const handlePincodeSubmit = () => {
    if (userPincode.length === 6) {
      localStorage.setItem('userPincode', userPincode);
      localStorage.setItem('locationSelected', 'true');
      setShowLocationModal(false);
    }
  };

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          try {
            const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`);
            const data = await response.json();
            if (data.pincode) {
              setUserPincode(data.pincode);
              localStorage.setItem('userPincode', data.pincode);
              localStorage.setItem('locationSelected', 'true');
              setShowLocationModal(false);
            }
          } catch (error) {
            console.error('Error fetching pincode:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Please enable location services or enter pincode manually');
        }
      );
    }
  };

  const isVendorAvailable = (vendor: any) => {
    if (!userPincode) return true;
    return vendor.areas.includes(userPincode);
  };

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
      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#FFF9EB] rounded-none max-w-md w-full p-8 shadow-2xl border border-[#1a1a1a]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#F7E47D] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#1a1a1a]" />
              </div>
              <h2 className="text-3xl serif mb-2">Select Location</h2>
              <p className="text-gray-600">To see cakes available in your area</p>
            </div>

            <button
              onClick={handleLocationRequest}
              className="w-full bg-[#1a1a1a] text-[#F7E47D] py-4 font-semibold mb-4 hover:bg-black transition-all duration-300 uppercase tracking-widest text-xs"
            >
              Use Current Location
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#FFF9EB] text-gray-500">Or enter manually</span>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter your pincode"
                maxLength={6}
                value={userPincode}
                onChange={(e) => setUserPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-[#1a1a1a] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#1a1a1a] transition-colors"
              />
              <button
                onClick={handlePincodeSubmit}
                disabled={userPincode.length !== 6}
                className="w-full border border-[#1a1a1a] text-[#1a1a1a] py-3 font-semibold hover:bg-[#1a1a1a] hover:text-[#F7E47D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
              >
                Continue
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                We deliver to: North Delhi, South Delhi, Gurgaon, Faridabad, Ghaziabad, Noida, Greater Noida
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
        {/* Vendors Section */}
        <section className="py-20 bg-[#1a1a1a] text-[#FFF9EB]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col items-center mb-12">
            <h2 className="serif text-4xl md:text-5xl mb-6 text-center">Available Vendors</h2>
            <button 
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#F7E47D] text-[#F7E47D] rounded-full hover:bg-[#F7E47D] hover:text-[#1a1a1a] transition-all duration-300 group"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-bold">
                {userPincode ? `Delivering to: ${userPincode}` : 'Select Location'}
              </span>
              <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
            </button>
          </div>

          {userPincode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vendors.map((vendor) => {
                const available = isVendorAvailable(vendor);
                return (
                  <div
                    key={vendor.id}
                    className={`p-8 border ${
                      available
                        ? 'border-[#F7E47D]/30 hover:border-[#F7E47D]'
                        : 'border-gray-800 opacity-50'
                    } transition-colors duration-300`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="text-4xl">{vendor.image}</div>
                      {available ? (
                        <span className="text-[#F7E47D] text-[10px] uppercase tracking-widest border border-[#F7E47D] px-2 py-1">
                          Delivers here
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[10px] uppercase tracking-widest border border-gray-500 px-2 py-1">
                          Not available
                        </span>
                      )}
                    </div>
                    <h3 className="serif text-2xl mb-2">{vendor.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#F7E47D] fill-[#F7E47D]" />
                        {vendor.rating} ({vendor.reviews})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {vendor.prepTime} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <span className="text-xs uppercase tracking-widest text-gray-500">Delivery Fee</span>
                      <span className="font-serif text-xl text-[#F7E47D]">₹{vendor.deliveryFee}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p className="text-xl font-light">Please select a location to view available vendors.</p>
            </div>
          )}
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="serif text-5xl md:text-7xl mb-6">Find Your Cake</h2>
            <p className="text-xl text-gray-600 font-light mb-8">Curated from the finest home bakers and cloud kitchens.</p>
          </div>

          {/* Search Bar */}
          {/* <div className="max-w-2xl mx-auto mb-12">
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
          </div> */}

          {/* Categories */}
          {/* <div className="flex flex-wrap justify-center gap-4 mb-16">
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
          </div> */}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCakes.slice(0, 8).map((cake) => (
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

          {/* View All Button */}
          <div className="mt-16 text-center">
            <Link href="/cakes" className="inline-block px-12 py-4 bg-[#1a1a1a] text-[#F7E47D] uppercase tracking-widest font-bold hover:bg-black transition-all duration-300">
              View All Cakes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 border border-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="serif text-2xl mb-2">Quick Delivery</h3>
              <p className="text-gray-600 font-light">Get your cake delivered in 2-4 hours</p>
            </div>
            <div>
              <div className="w-16 h-16 border border-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="serif text-2xl mb-2">Top Quality</h3>
              <p className="text-gray-600 font-light">Fresh ingredients, amazing taste</p>
            </div>
            <div>
              <div className="w-16 h-16 border border-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="serif text-2xl mb-2">Live Tracking</h3>
              <p className="text-gray-600 font-light">Track your order in real-time</p>
            </div>
          </div>

          {/* Profile Button */}
          <div className="flex justify-center mt-16">
            <Link href="/profile" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1a1a1a] text-[#F7E47D] rounded-full hover:bg-black transition-all duration-300 group">
              <User className="w-5 h-5" />
              <span className="text-sm uppercase tracking-widest font-bold">My Profile & Dashboard</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
