// src/components/landingPage/Hero.tsx
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Truck, Star, ChevronDown, X, Check, TrendingUp, DollarSign, Award } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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

function LandingPage() {
  type FloatingCake = { id: number; emoji: string; left: number; delay: number; duration: number };
  type UserLocation = { lat?: number; lng?: number; pincode?: string } | null;
  const [showLocationModal, setShowLocationModal] = useState(() => {
    // Initialize from localStorage, default to true if not found
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locationSelected');
      return saved ? false : true;
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
  const [cakes, setCakes] = useState<CakeType[]>([]);
  const containerRef = useRef(null);

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

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from('.hero-content', {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    })
    .from('.category-pill', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'back.out(1.7)'
    }, '-=0.5');
  }, { scope: containerRef });

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userPincode.length === 6) {
      localStorage.setItem('userPincode', userPincode);
      localStorage.setItem('locationSelected', 'true');
      setShowLocationModal(false);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`);
            const data = await response.json();
            if (data.pincode) {
              setUserPincode(data.pincode);
              setUserLocation({ lat: latitude, lng: longitude, pincode: data.pincode });
              localStorage.setItem('userPincode', data.pincode);
              localStorage.setItem('locationSelected', 'true');
              setShowLocationModal(false);
            }
          } catch (error) {
            console.error('Error detecting location:', error);
            alert('Could not detect location automatically. Please enter pincode.');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Please enable location access or enter pincode manually.');
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
      const matchesCategory = selectedCategory === 'all' || cake.category === selectedCategory;
      return matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      if (sortBy === 'vendor') return (a.vendorName || '').localeCompare(b.vendorName || '');
      return 0;
    });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FFF9EB] text-[#1a1a1a] font-sans">
      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFF9EB] rounded-none p-8 max-w-md w-full shadow-2xl border border-[#1a1a1a]/10 animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-[#F7E47D]" />
              </div>
              <h2 className="serif text-3xl mb-2">Where are you?</h2>
              <p className="text-gray-600 font-light">To show you the best cakes nearby</p>
            </div>

            <button
              onClick={detectLocation}
              className="w-full py-4 bg-[#1a1a1a] text-[#F7E47D] uppercase tracking-widest font-bold hover:bg-black transition-all mb-6 flex items-center justify-center gap-2 group"
            >
              <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Detect My Location
            </button>

            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-[#1a1a1a]/10"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest">Or enter pincode</span>
              <div className="flex-grow border-t border-[#1a1a1a]/10"></div>
            </div>

            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                value={userPincode}
                onChange={(e) => setUserPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-4 bg-transparent border border-[#1a1a1a]/20 focus:border-[#1a1a1a] outline-none text-center text-lg tracking-widest placeholder:text-gray-400 transition-colors"
              />
              <button
                type="submit"
                disabled={userPincode.length !== 6}
                className="w-full py-4 bg-white border border-[#1a1a1a] text-[#1a1a1a] uppercase tracking-widest font-bold hover:bg-[#1a1a1a] hover:text-[#F7E47D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Exploring
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-content mb-6 inline-block px-4 py-1 border border-[#1a1a1a]/20 rounded-full">
              <span className="text-xs uppercase tracking-[0.2em] font-bold">Premium Cake Delivery</span>
            </div>
            
            <h1 className="hero-content serif text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight">
              Artisan Cakes <br />
              <span className="italic text-[#1a1a1a]/80">Delivered Fresh</span>
            </h1>
            
            <p className="hero-content text-xl text-gray-600 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover handcrafted cakes from the city's finest bakers. 
              Delivered to your doorstep in minutes.
            </p>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? 'all' : cat)}
                  className={`category-pill px-6 py-2 rounded-full border transition-all text-sm uppercase tracking-widest ${
                    selectedCategory === cat
                      ? 'bg-[#1a1a1a] text-[#F7E47D] border-[#1a1a1a]'
                      : 'bg-transparent border-[#1a1a1a]/20 hover:border-[#1a1a1a] text-[#1a1a1a]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="hero-content flex flex-wrap justify-center gap-12 md:gap-24 border-t border-[#1a1a1a]/10 pt-12">
              {[
                { label: 'Vendors', value: '100+' },
                { label: 'Designs', value: '500+' },
                { label: 'Delivery', value: '2 hrs' },
                { label: 'Rating', value: '4.8★' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="serif text-3xl md:text-4xl mb-2">{stat.value}</div>
                  <div className="text-xs uppercase tracking-widest text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-6 bg-[#FFF9EB]/90 backdrop-blur-md sticky top-[72px] z-30 border-y border-[#1a1a1a]/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Sort by:</span>
              {[
                { id: 'popularity', icon: TrendingUp, label: 'Popularity' },
                { id: 'price', icon: DollarSign, label: 'Price' },
                { id: 'vendor', icon: Award, label: 'Vendor' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-all ${
                    sortBy === option.id
                      ? 'bg-[#1a1a1a] text-[#F7E47D]'
                      : 'hover:bg-[#1a1a1a]/5'
                  }`}
                >
                  <option.icon className="w-3 h-3" />
                  {option.label}
                </button>
              ))}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-500">
              Showing {filteredCakes.length} of {cakes.length} cakes
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Section */}
      {userPincode && (
        <section className="py-20 border-b border-[#1a1a1a]/10">
          <div className="container mx-auto px-4">
            <h2 className="serif text-3xl md:text-4xl mb-12 flex items-center gap-4">
              <span className="w-12 h-12 bg-[#1a1a1a] text-[#F7E47D] flex items-center justify-center rounded-full">
                <Truck className="w-6 h-6" />
              </span>
              Available Vendors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vendors.map((vendor) => {
                const available = isVendorAvailable(vendor);
                return (
                  <div
                    key={vendor.id}
                    className={`group bg-white p-8 border border-[#1a1a1a]/10 hover:border-[#1a1a1a] transition-all duration-500 ${
                      !available && 'opacity-60 grayscale'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-500">{vendor.image}</div>
                      {available ? (
                        <span className="bg-[#1a1a1a] text-[#F7E47D] text-[10px] uppercase tracking-widest px-3 py-1 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Delivers here
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest px-3 py-1 font-bold flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Not available
                        </span>
                      )}
                    </div>
                    <h3 className="serif text-2xl mb-2">{vendor.name}</h3>
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-6 font-light">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#1a1a1a] fill-[#1a1a1a]" />
                        {vendor.rating} ({vendor.reviews})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {vendor.prepTime} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-[#1a1a1a]/10">
                      <span className="text-xs uppercase tracking-widest text-gray-500">Delivery Fee</span>
                      <span className="serif text-lg">₹{vendor.deliveryFee}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Cakes Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="serif text-3xl md:text-4xl mb-12 text-center">Popular Cakes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCakes.map((cake, index) => (
              <div
                key={cake.id}
                className="group bg-white border border-[#1a1a1a]/10 hover:border-[#1a1a1a] transition-all duration-500 hover:-translate-y-1"
              >
                <div className="h-64 bg-[#FFF9EB] flex items-center justify-center text-8xl group-hover:scale-105 transition-transform duration-700 border-b border-[#1a1a1a]/10">
                  🎂
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="serif text-xl leading-tight mb-1">{cake.name}</h3>
                    <span className="text-[10px] bg-[#1a1a1a] text-[#F7E47D] px-2 py-1 uppercase tracking-widest font-bold whitespace-nowrap ml-2">
                      {cake.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">{cake.vendorName}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]/10">
                    <span className="serif text-2xl">₹{cake.price}</span>
                    <Link href={`/cakes/${cake.vendorId}/${cake.slug}`}>
                      <button className="px-6 py-2 border border-[#1a1a1a] text-[#1a1a1a] text-xs uppercase tracking-widest font-bold hover:bg-[#1a1a1a] hover:text-[#F7E47D] transition-all">
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#1a1a1a] text-[#FFF9EB]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-24 h-24 border border-[#F7E47D]/30 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:border-[#F7E47D] transition-colors duration-500">
                <Clock className="w-10 h-10 text-[#F7E47D]" />
              </div>
              <h3 className="serif text-2xl mb-4 text-[#F7E47D]">Quick Delivery</h3>
              <p className="text-white/60 font-light max-w-xs mx-auto">Get your handcrafted cake delivered fresh in 2-4 hours.</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 border border-[#F7E47D]/30 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:border-[#F7E47D] transition-colors duration-500">
                <Star className="w-10 h-10 text-[#F7E47D]" />
              </div>
              <h3 className="serif text-2xl mb-4 text-[#F7E47D]">Top Quality</h3>
              <p className="text-white/60 font-light max-w-xs mx-auto">Curated selection from the city's most awarded bakers.</p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 border border-[#F7E47D]/30 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:border-[#F7E47D] transition-colors duration-500">
                <Truck className="w-10 h-10 text-[#F7E47D]" />
              </div>
              <h3 className="serif text-2xl mb-4 text-[#F7E47D]">Live Tracking</h3>
              <p className="text-white/60 font-light max-w-xs mx-auto">Real-time updates from the bakery to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
