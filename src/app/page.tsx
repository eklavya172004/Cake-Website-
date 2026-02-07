"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Heart, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface CakeProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  discount?: number;
  flavor?: string;
  vendorId?: string;
  vendorName?: string;
  slug?: string;
}

interface HeroBanner {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
}

const heroBanners: HeroBanner[] = [
  {
    id: 1,
    title: "CRAFTED LIKE FINE ART",
    subtitle: "GOURMET COLLECTION",
    buttonText: "ORDER NOW",
    imageUrl: "/images/Hero-section/image1.avif"
  },
  {
    id: 2,
    title: "MAGIC IN EVERY WISH",
    subtitle: "BIRTHDAY CAKES",
    buttonText: "ORDER NOW",
    imageUrl: "/images/Hero-section/image2.webp"
  },
  {
    id: 3,
    title: "ELEGANCE IN EVERY BITE",
    subtitle: "DESIGNER CAKES",
    buttonText: "ORDER NOW",
    imageUrl: "/images/Hero-section/image3.webp"
  },
];

const promises = [
  { title: "ON-TIME DELIVERY", description: "Because no one likes late surprises." },
  { title: "500+ DESIGNS", description: "Wishes come in all shapes and sizes." },
  { title: "2 CR+ ORDERS", description: "You can close your eyes and trust us." },
  { title: "BAKED FRESH", description: "Spreading smiles, one slice at a time." },
];

export default function Home() {
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [cakes, setCakes] = useState<CakeProduct[]>([]);
  const [loadingCakes, setLoadingCakes] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch cakes from API
  useEffect(() => {
    const fetchCakes = async () => {
      try {
        setLoadingCakes(true);
        const response = await fetch('/api/cakes');
        const data = await response.json();
        
        // Map API response to CakeProduct interface
        const mappedCakes = data.slice(0, 8).map((cake: any) => ({
          id: cake.id,
          name: cake.name,
          price: cake.basePrice,
          rating: cake.vendor?.rating || 4.9,
          reviews: cake.vendor?.totalReviews || Math.floor(Math.random() * 5000) + 500,
          image: cake.images?.[0] || cake.vendor?.logo || "🍰", // Show first cake image, fallback to vendor logo, then emoji
          vendorId: cake.vendor?.id || cake.vendorId,
          vendorName: cake.vendor?.name || "Unknown Vendor",
          slug: cake.slug,
          flavor: cake.category,
        }));
        
        setCakes(mappedCakes);
      } catch (error) {
        console.error('Error fetching cakes:', error);
        // Keep empty array on error instead of using mock data
        setCakes([]);
      } finally {
        setLoadingCakes(false);
      }
    };

    fetchCakes();
  }, []);

  // Auto-carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % heroBanners.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCakeClick = (cakeId: string, vendorId: string, slug: string) => {
    // Use actual vendor and cake slug from database
    router.push(`/cakes/${vendorId}/${slug}`);
  };

  const nextBanner = () => {
    setCurrentBannerIdx((prev) => (prev + 1) % heroBanners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIdx((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const currentBanner = heroBanners[currentBannerIdx];

  return (
    <main className="w-full bg-white pt-36">
      {/* Hero Section with Full-Screen Carousel */}
      <section className="relative w-full h-screen overflow-hidden z-0">
        {/* Carousel Images */}
        <div className="relative w-full h-full">
          {heroBanners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentBannerIdx ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.subtitle}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
            </div>
          ))}
        </div>

        {/* Text Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-end px-12 pt-32">
          <div className="text-white max-w-2xl">
            <h2 className="text-6xl md:text-7xl font-bold italic mb-4 drop-shadow-lg">
              {currentBanner.title}
            </h2>
            <p className="text-3xl md:text-4xl font-bold mb-8 drop-shadow-md">
              {currentBanner.subtitle}
            </p>
            <button
              onClick={() => router.push("/cakes")}
              className="px-8 py-3 bg-pink-600 text-white font-bold text-lg rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {currentBanner.buttonText}
            </button>
          </div>
        </div>

        {/* Decorative Stars */}
        <div className="absolute top-20 right-32 text-yellow-400 text-3xl animate-pulse">✨</div>
        <div className="absolute bottom-32 right-40 text-yellow-300 text-2xl animate-bounce">⭐</div>
        <div className="absolute top-40 right-56 text-yellow-400 text-2xl opacity-70">✨</div>

        {/* Navigation Arrows */}
        <button
          onClick={prevBanner}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-pink-600 rounded-full p-3 transition-all duration-300 z-10 hover:shadow-lg"
        >
          <ChevronLeft className="text-white" size={32} />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-pink-600 rounded-full p-3 transition-all duration-300 z-10 hover:shadow-lg"
        >
          <ChevronRight className="text-white" size={32} />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBannerIdx(idx)}
              className={`transition-all ${
                idx === currentBannerIdx 
                  ? "bg-pink-600 w-8 h-3" 
                  : "bg-white/40 w-3 h-3 hover:bg-pink-400"
              } rounded-full`}
            />
          ))}
        </div>

        {/* Wavy Bottom Decoration */}
        <svg
          className="absolute bottom-0 left-0 w-full h-auto"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z"
            fill="#f9f3f0"
            opacity="0.8"
          />
          <path
            d="M0,60 Q360,30 720,60 T1440,60 L1440,100 L0,100 Z"
            fill="#f3e8dc"
            opacity="0.6"
          />
        </svg>
      </section>

      {/* What We Do - Animated Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-50 via-orange-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">Why Choose PurblePalace</h2>
            <p className="text-gray-700 text-lg animate-fade-in animation-delay-200">Everything you need for the perfect cake experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1: Custom Cakes */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white rounded-lg p-8 hover:scale-105 transition-transform duration-300 animate-slide-up animation-delay-0">
                <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">🎨</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Cake Design</h3>
                <p className="text-gray-600 text-sm">Create your own masterpiece! Customize flavors, design, colors and make every celebration uniquely yours</p>
              </div>
            </div>

            {/* Card 2: Split Payment */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white rounded-lg p-8 hover:scale-105 transition-transform duration-300 animate-slide-up animation-delay-100">
                <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">💳</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Split Payment</h3>
                <p className="text-gray-600 text-sm">Flexible payment options! Split your purchase into easy installments with zero extra charges</p>
              </div>
            </div>

            {/* Card 3: Location Based */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white rounded-lg p-8 hover:scale-105 transition-transform duration-300 animate-slide-up animation-delay-200">
                <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">📍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Top Sellers Near You</h3>
                <p className="text-gray-600 text-sm">Discover the most popular cakes in your location curated just for you. See what's trending locally!</p>
              </div>
            </div>

            {/* Card 4: Huge Variety */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white rounded-lg p-8 hover:scale-105 transition-transform duration-300 animate-slide-up animation-delay-300">
                <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">🍰</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Huge Variety</h3>
                <p className="text-gray-600 text-sm">1000+ varieties across all flavors, themes & occasions. From classic to contemporary, we have it all!</p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }

          .animation-delay-200 {
            animation-delay: 0.2s;
          }

          .animate-slide-up {
            animation: slideUp 0.6s ease-out forwards;
            opacity: 0;
          }

          .animation-delay-0 {
            animation-delay: 0s;
          }

          .animation-delay-100 {
            animation-delay: 0.1s;
          }

          .animation-delay-200 {
            animation-delay: 0.2s;
          }

          .animation-delay-300 {
            animation-delay: 0.3s;
          }
        `}</style>
      </section>

      {/* Top Sellers Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">🏆 Top Sellers</h3>
            <p className="text-gray-600">Most loved cakes by our customers</p>
          </div>

          {/* Cakes Grid - 4x4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCakes ? (
              <div className="col-span-full text-center py-8 text-gray-600">Loading cakes...</div>
            ) : cakes.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600">No cakes available</div>
            ) : (
              cakes.map((cake) => (
                <div
                  key={cake.id}
                  onClick={() => handleCakeClick(cake.id, cake.vendorId || '', cake.slug || '')}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer border border-gray-200 hover:border-pink-300"
                >
                {/* Cake Image */}
                <div className="relative bg-gradient-to-br from-pink-50 to-orange-50 aspect-square flex items-center justify-center overflow-hidden group">
                  {cake.image && cake.image.startsWith('http') ? (
                    <img 
                      src={cake.image} 
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                    />
                  ) : cake.image && cake.image.length === 1 ? (
                    <div className="text-6xl group-hover:scale-110 transition">{cake.image}</div>
                  ) : (
                    <img 
                      src={cake.image || 'https://via.placeholder.com/400?text=Cake'} 
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Cake';
                      }}
                    />
                  )}
                  {cake.discount && (
                    <div className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                      {cake.discount}% OFF
                    </div>
                  )}
                  <button className="absolute bottom-3 right-3 bg-pink-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-pink-700">
                    <Heart size={18} className="fill-white" />
                  </button>
                </div>

                {/* Cake Details */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{cake.name}</h4>
                  
                  {/* Vendor Name */}
                  {cake.vendorName && (
                    <p className="text-xs text-gray-500 mb-2">{cake.vendorName}</p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{cake.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({cake.reviews.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-pink-600">₹{cake.price}</span>
                    {cake.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{cake.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Available in Your Location Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">📍 Trending Cakes</h3>
            <p className="text-gray-600">Fresh cakes delivered to your doorstep</p>
          </div>

          {/* Cakes Grid - 4x4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cakes.slice(0, 8).map((cake) => (
              <div
                key={cake.id}
                onClick={() => handleCakeClick(cake.id, cake.vendorId || '', cake.slug || '')}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden"
              >
                {/* Cake Image */}
                <div className="relative bg-gradient-to-br from-pink-50 to-orange-50 aspect-square flex items-center justify-center overflow-hidden group">
                  {cake.image && cake.image.startsWith('http') ? (
                    <img 
                      src={cake.image} 
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : cake.image && cake.image.length === 1 ? (
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{cake.image}</div>
                  ) : (
                    <img 
                      src={cake.image || 'https://via.placeholder.com/400?text=Cake'} 
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Cake';
                      }}
                    />
                  )}
                  {cake.discount && (
                    <div className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                      {cake.discount}% OFF
                    </div>
                  )}
                  <button className="absolute bottom-3 right-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-md hover:shadow-lg">
                    <Heart size={18} className="text-pink-600" />
                  </button>
                </div>

                {/* Cake Details */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{cake.name}</h4>
                  
                  {/* Vendor Name */}
                  {cake.vendorName && (
                    <p className="text-xs text-gray-500 mb-2">{cake.vendorName}</p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{cake.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({cake.reviews.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">₹{cake.price}</span>
                    {cake.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{cake.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Cakes Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">✨ More Delicious Cakes</h3>
            <p className="text-gray-600">Explore our full collection</p>
          </div>

          {/* Cakes Grid - 4x4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cakes.map((cake) => (
              <div
                key={`more-${cake.id}`}
                onClick={() => handleCakeClick(cake.id, cake.vendorId || '', cake.slug || '')}
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer border border-gray-200"
              >
                {/* Cake Image */}
                <div className="relative bg-gradient-to-br from-red-50 to-pink-50 aspect-square flex items-center justify-center overflow-hidden group">
                  {cake.image && (cake.image.startsWith('http') || cake.image.startsWith('/')) ? (
                    <img
                      src={cake.image}
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-6xl group-hover:scale-110 transition">{cake.image || "🎂"}</div>
                  )}
                  {cake.discount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {cake.discount}% OFF
                    </div>
                  )}
                  <button className="absolute bottom-3 right-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-md">
                    <Heart size={18} className="text-red-600" />
                  </button>
                </div>

                {/* Cake Details */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{cake.name}</h4>
                  
                  {/* Vendor Name */}
                  {cake.vendorName && (
                    <p className="text-xs text-gray-500 mb-2">{cake.vendorName}</p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{cake.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({cake.reviews.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">₹{cake.price}</span>
                    {cake.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{cake.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push("/cakes")}
              className="px-8 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
            >
              View More Cakes
            </button>
          </div>
        </div>
      </section>
      <section className="bg-white py-12 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {promises.map((promise, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">{promise.title}</div>
                <p className="text-gray-600 text-sm">{promise.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cakes Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">India Loves</h3>
            <p className="text-gray-600">Bestsellers from across the country</p>
          </div>

          {/* Cakes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cakes.map((cake) => (
              <div
                key={cake.id}
                onClick={() => handleCakeClick(cake.id, cake.vendorId || '', cake.slug || '')}
                className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer border border-gray-200 hover:border-pink-300"
              >
                {/* Cake Image */}
                <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden group">
                  {cake.image && (cake.image.startsWith('http') || cake.image.startsWith('/')) ? (
                    <img 
                      src={cake.image} 
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-6xl group-hover:scale-110 transition">{cake.image || "🎂"}</div>
                  )}
                  {cake.discount && (
                    <div className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                      {cake.discount}% OFF
                    </div>
                  )}
                  <button className="absolute bottom-3 right-3 bg-pink-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-pink-700">
                    <Heart size={18} className="fill-white" />
                  </button>
                </div>

                {/* Cake Details */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{cake.name}</h4>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{cake.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({cake.reviews.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-pink-600">₹{cake.price}</span>
                    {cake.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{cake.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push("/cakes")}
              className="px-8 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition"
            >
              VIEW ALL CAKES
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose PurblePalace For Online Cake Delivery?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">🎂 Fresh & Delicious</h4>
              <p className="text-gray-600">
                All cakes are baked fresh using premium ingredients. Soft, moist, and full of flavor.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">🚚 Same-Day Delivery</h4>
              <p className="text-gray-600">
                Order before 8 PM and get delivery the same day. Free delivery on orders above ₹500.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">🎨 500+ Designs</h4>
              <p className="text-gray-600">
                From classic to customized, we have designs for every occasion and celebration.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">✅ FSSAI Certified</h4>
              <p className="text-gray-600">
                Trusted and certified. Quality you can rely on for your special moments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Variety Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Variety And Flavors That Make You Surrender Your Senses
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Chocolate", "Vanilla", "Red Velvet", "Butterscotch", "Strawberry", "Fruit", "Mango", "Coffee", "Black Forest", "Cheesecake", "Rasmalai", "Pineapple"].map((flavor, idx) => (
              <button
                key={idx}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-600 hover:text-pink-600 transition text-center font-medium"
              >
                {flavor}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Order Cake Online With Our Special Delivery Services
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
              <Clock className="text-pink-600 mb-3" size={32} />
              <h4 className="font-semibold text-gray-900 mb-2">Same-Day Delivery</h4>
              <p className="text-sm text-gray-600">Free delivery</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
              <Clock className="text-pink-600 mb-3" size={32} />
              <h4 className="font-semibold text-gray-900 mb-2">2-Hour Delivery</h4>
              <p className="text-sm text-gray-600">Ultra-fast delivery</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
              <Clock className="text-pink-600 mb-3" size={32} />
              <h4 className="font-semibold text-gray-900 mb-2">Fixed Time Delivery</h4>
              <p className="text-sm text-gray-600">₹150 extra</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
              <Clock className="text-pink-600 mb-3" size={32} />
              <h4 className="font-semibold text-gray-900 mb-2">Midnight Delivery</h4>
              <p className="text-sm text-gray-600">₹250 extra</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-600 to-pink-700">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h3 className="text-4xl font-bold mb-4">Ready to Order?</h3>
          <p className="text-lg mb-8 opacity-90">Browse our collection and find the perfect cake for your celebration.</p>
          <button
            onClick={() => router.push("/cakes")}
            className="px-8 py-4 bg-white text-pink-600 font-bold rounded-lg hover:bg-gray-100 transition"
          >
            EXPLORE OUR CAKES
          </button>
        </div>
      </section>
    </main>
  );
}
