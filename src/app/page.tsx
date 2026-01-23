"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Star, Truck, Clock, Award, Heart, ChevronLeft, ChevronRight, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AuthModal from "@/components/auth/AuthModal";

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

const categories = ["Cakes", "Theme Cakes", "By Relationship", "Desserts", "Birthday", "Hampers", "Anniversary", "Occasions", "Customized Cakes"];

const categoryMenus: Record<string, { title: string; items: string[] }[]> = {
  "Cakes": [
    {
      title: "⭐ Trending Cakes",
      items: ["Ribbon Cakes", "Fresh Drops", "Gourmet Cakes", "Bento Cakes", "Camera Cakes", "Anime Cakes", "Labubu Cakes", "Cricket Cakes", "Pinata Cakes", "Drip Cakes"]
    },
    {
      title: "⭐ By Type",
      items: ["Bestsellers", "Eggless Cakes", "Photo Cakes", "Cheese Cakes", "Half Cakes", "Heart Shaped Cakes", "Rose Cakes", "All Cakes"]
    },
    {
      title: "⭐ By Flavours",
      items: ["Chocolate Cakes", "Butterscotch Cakes", "Strawberry Cakes", "Pineapple Cakes", "Kit Kat Cakes", "Black Forest Cakes", "Red Velvet Cakes", "Vanilla Cakes", "Fruit Cakes", "Blueberry Cakes"]
    },
    {
      title: "⭐ Delivery Cities",
      items: ["Cakes To Bangalore", "Cakes To Delhi", "Cakes To Gurgaon", "Cakes To Hyderabad", "Cakes To Noida", "Cakes To Mumbai", "Cakes To Jaipur", "Cakes To Pune", "Cakes To Chandigarh", "Cakes To Chennai"]
    }
  ],
  "Theme Cakes": [
    {
      title: "⭐ Popular Themes",
      items: ["Barbie Cakes", "Spiderman Cakes", "Avengers Cakes", "Cars Cakes", "Disney Cakes", "Harry Potter Cakes", "Minecraft Cakes"]
    },
    {
      title: "⭐ By Occasion",
      items: ["Birthday Cakes", "Wedding Cakes", "Anniversary Cakes", "Graduation Cakes"]
    }
  ],
  "By Relationship": [
    {
      title: "⭐ For Him",
      items: ["Boyfriend Cakes", "Father Cakes", "Brother Cakes", "Son Cakes"]
    },
    {
      title: "⭐ For Her",
      items: ["Girlfriend Cakes", "Mother Cakes", "Sister Cakes", "Daughter Cakes"]
    },
    {
      title: "⭐ For Others",
      items: ["Friend Cakes", "Teacher Cakes", "Colleague Cakes", "Boss Cakes"]
    }
  ],
  "Desserts": [
    {
      title: "⭐ Sweet Treats",
      items: ["Brownies", "Cupcakes", "Jar Cakes", "Pastries", "Cookies", "Cheesecakes", "Mousse Cakes"]
    }
  ],
  "Birthday": [
    {
      title: "⭐ Birthday Cakes",
      items: ["Kids Birthday Cakes", "Adult Birthday Cakes", "Themed Birthday Cakes", "Personalized Cakes"]
    }
  ],
  "Hampers": [
    {
      title: "⭐ Gift Hampers",
      items: ["Cake Hampers", "Chocolate Hampers", "Dry Fruit Hampers", "Fruit Hampers", "Combo Hampers"]
    }
  ],
  "Anniversary": [
    {
      title: "⭐ Anniversary Cakes",
      items: ["1st Anniversary", "5th Anniversary", "10th Anniversary", "25th Anniversary", "50th Anniversary"]
    }
  ],
  "Occasions": [
    {
      title: "⭐ Festival Cakes",
      items: ["Diwali Cakes", "Christmas Cakes", "New Year Cakes", "Valentine Cakes", "Holi Cakes"]
    },
    {
      title: "⭐ Special Days",
      items: ["Mother's Day", "Father's Day", "Women's Day", "Friendship Day", "Teachers Day"]
    }
  ],
  "Customized Cakes": [
    {
      title: "⭐ Personalized",
      items: ["Photo Cakes", "Name Cakes", "Message Cakes", "Custom Flavour", "Custom Design"]
    }
  ]
};

const promises = [
  { title: "ON-TIME DELIVERY", description: "Because no one likes late surprises." },
  { title: "500+ DESIGNS", description: "Wishes come in all shapes and sizes." },
  { title: "2 CR+ ORDERS", description: "You can close your eyes and trust us." },
  { title: "BAKED FRESH", description: "Spreading smiles, one slice at a time." },
];

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("Delivering To");
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [locationInput, setLocationInput] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [cakes, setCakes] = useState<CakeProduct[]>([]);
  const [loadingCakes, setLoadingCakes] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  const availableAreas = ["Noida", "Gurgaon", "Delhi", "North Delhi", "South Delhi", "Faridabad", "Ghaziabad", "Greater Noida"];

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
          rating: 4.9,
          reviews: Math.floor(Math.random() * 5000) + 500,
          image: "🍰",
          vendorId: cake.vendor?.id || cake.vendorId,
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

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("userLocation", location);
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        // For now, we'll just select "North Delhi" as default
        handleLocationSelect("North Delhi");
      });
    } else {
      alert("Geolocation not supported by your browser");
    }
  };

  const handleLocationChange = () => {
    setShowLocationModal(true);
  };

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
    <main className="w-full bg-white">
      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-3xl max-w-2xl w-full mx-4 p-8 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Select Delivery Location</h2>

            {/* Description */}
            <p className="text-gray-600 text-lg mb-8">
              We currently deliver to <span className="font-semibold text-gray-900">North Delhi, South Delhi, Gurgaon, Faridabad, Ghaziabad, Noida, and Greater Noida.</span>
            </p>

            {/* Detect Location Button */}
            <button
              onClick={handleDetectLocation}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-2xl mb-8 flex items-center justify-center gap-3 transition text-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
              </svg>
              Detect My Current Location
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-400 font-medium text-sm uppercase">Or Enter Manually</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Location Input */}
            <input
              type="text"
              placeholder="Enter Pincode or City"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl mb-8 text-lg focus:outline-none focus:border-red-600"
            />

            {/* Quick Selection Buttons */}
            <div className="flex flex-wrap gap-3">
              {availableAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => handleLocationSelect(area)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition text-sm"
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Red Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white py-3 px-4">
        <div className="max-w-full mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-6">
              <div className="border-2 border-white rounded-lg px-3 py-1">
                <h1 className="text-2xl font-bold italic">PurplePalace</h1>
              </div>
              <button
                onClick={handleLocationChange}
                className="flex items-center gap-2 text-sm bg-red-700 hover:bg-red-800 px-3 py-2 rounded transition"
              >
                <MapPin size={16} />
                {selectedLocation}
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative bg-white rounded-full">
                <input
                  type="text"
                  placeholder="Search For Cakes, Occasion, Flavour And More..."
                  className="w-full px-4 py-2 rounded-full text-black placeholder-gray-500 focus:outline-none bg-white"
                />
                <Search className="absolute right-4 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-6 text-sm font-medium">
              <button className="flex flex-col items-center gap-1 hover:opacity-80">
                <Award size={18} />
                <span className="text-xs">Track Order</span>
              </button>
              <button className="flex flex-col items-center gap-1 hover:opacity-80">
                <ShoppingCart size={18} />
                <span className="text-xs">Cart</span>
              </button>
              <button
                onClick={() => session ? router.push("/profile") : setAuthModalOpen(true)}
                className="flex flex-col items-center gap-1 hover:opacity-80"
              >
                <User size={18} />
                <span className="text-xs">{session ? "Profile" : "Login/Signup"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* White Navigation Bar */}
      <nav 
        className="fixed top-20 left-0 right-0 z-[999] bg-white border-b border-gray-100 shadow-lg"
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div className="max-w-full mx-auto px-4">
          <div className="flex gap-8 overflow-visible pb-2 text-sm font-medium">
            {categories.map((category) => (
              <div 
                key={category} 
                className="relative"
              >
                <button
                  className={`transition whitespace-nowrap flex items-center gap-1 py-3 px-2 ${
                    hoveredCategory === category 
                      ? "text-red-600 border-b-2 border-red-600" 
                      : "text-gray-700 border-b-2 border-transparent hover:text-red-600"
                  }`}
                  onMouseEnter={() => setHoveredCategory(category)}
                >
                  {category}
                  {category === "Hampers" && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">New</span>}
                </button>

                {/* Dropdown Menu */}
                {categoryMenus[category] && hoveredCategory === category && (
                  <div 
                    className="fixed left-0 right-0 z-[9999] bg-white shadow-2xl border-t-2 border-red-600"
                    style={{ top: "140px", paddingTop: "24px", paddingBottom: "24px", paddingLeft: "32px", paddingRight: "32px" }}
                  >
                    <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12">
                      {categoryMenus[category].map((section, idx) => (
                        <div key={idx} className="pr-4">
                          <h3 className="font-bold text-gray-900 mb-5 text-sm flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            {section.title.replace("⭐ ", "")}
                          </h3>
                          <ul className="space-y-3">
                            {section.items.map((item) => (
                              <li key={item}>
                                <a
                                  href="#"
                                  className="text-gray-700 hover:text-red-600 text-sm transition font-medium"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invisible Bridge - Covers gap between navbar and dropdown */}
                {hoveredCategory === category && categoryMenus[category] && (
                  <div 
                    className="fixed left-0 right-0 z-[9998]"
                    style={{ top: "80px", height: "60px", pointerEvents: "auto" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section with Full-Screen Carousel */}
      <section className="relative w-full h-screen overflow-hidden pt-32 z-0">
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
              className="px-8 py-3 bg-red-600 text-white font-bold text-lg rounded hover:bg-red-700 transition"
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
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
        >
          <ChevronLeft className="text-white" size={32} />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
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
                  ? "bg-white w-8 h-3" 
                  : "bg-white/50 w-3 h-3 hover:bg-white/70"
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">Why Choose PurplePalace</h2>
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
                  className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer border border-gray-200"
                >
                {/* Cake Image */}
                <div className="relative bg-gradient-to-br from-pink-50 to-orange-50 aspect-square flex items-center justify-center overflow-hidden group">
                  <div className="text-6xl group-hover:scale-110 transition">{cake.image}</div>
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
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{cake.name}</h4>

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
              ))
            )}
          </div>
        </div>
      </section>

      {/* Available in Your Location Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">📍 Available in {selectedLocation}</h3>
            <p className="text-gray-600">Fresh cakes delivered to your doorstep</p>
          </div>

          {/* Cakes Grid - 4x4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cakes.slice(0, 8).map((cake) => (
              <div
                key={cake.id}
                onClick={() => handleCakeClick(cake.id, cake.vendorId || '', cake.slug || '')}
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer border border-gray-200"
              >
                {/* Cake Image */}
                <div className="relative bg-gradient-to-br from-orange-50 to-pink-50 aspect-square flex items-center justify-center overflow-hidden group">
                  <div className="text-6xl group-hover:scale-110 transition">{cake.image}</div>
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
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{cake.name}</h4>

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
                  <div className="text-6xl group-hover:scale-110 transition">{cake.image}</div>
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
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{cake.name}</h4>

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
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-lg"
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
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
              >
                {/* Cake Image */}
                <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden group">
                  <div className="text-6xl group-hover:scale-110 transition">{cake.image}</div>
                  {cake.discount && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {cake.discount}% OFF
                    </div>
                  )}
                  <button className="absolute bottom-3 right-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
                    <Heart size={18} className="text-pink-600" />
                  </button>
                </div>

                {/* Cake Details */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{cake.name}</h4>

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
            Why Choose PurplePalace For Online Cake Delivery?
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

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-white mb-4">PurplePalace</h4>
            <p className="text-sm">Your trusted online bakery for fresh, delicious cakes.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/cakes" className="hover:text-white transition">All Cakes</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition">Cancellation & Refund</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
              <a href="#" className="hover:text-white transition">Twitter</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 PurplePalace. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </main>
  );
}
