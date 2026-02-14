'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Home, User, Search, ShoppingCart, MapPin, Package, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import { useHideNavbar } from '@/components/HideNavbarProvider';

interface CakeSuggestion {
  id: string;
  name: string;
  slug: string;
  vendorId: string;
  basePrice?: number;
}

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  vendorId?: string;
}

const categories = [
  {
    name: 'Cakes',
    submenu: [
      {
        title: 'Trending Cakes',
        items: [
          { label: 'Ribbon Cakes', param: 'cakeType=Ribbon Cakes' },
          { label: 'Fresh Drops', param: 'cakeType=Fresh Drops' },
          { label: 'Gourmet Cakes', param: 'cakeType=Gourmet Cakes' },
          { label: 'Bento Cakes', param: 'cakeType=Bento Cakes' },
          { label: 'Camera Cakes', param: 'cakeType=Camera Cakes' },
          { label: 'Anime Cakes', param: 'cakeType=Anime Cakes' },
        ]
      },
      {
        title: 'By Type',
        items: [
          { label: 'Bestsellers', param: 'cakeType=Bestsellers' },
          { label: 'Eggless Cakes', param: 'cakeType=Eggless Cakes' },
          { label: 'Photo Cakes', param: 'cakeType=Photo Cakes' },
          { label: 'Cheese Cakes', param: 'cakeType=Cheese Cakes' },
          { label: 'Half Cakes', param: 'cakeType=Half Cakes' },
        ]
      },
      {
        title: 'By Flavours',
        items: [
          { label: 'Chocolate', param: 'flavor=Chocolate' },
          { label: 'Vanilla', param: 'flavor=Vanilla' },
          { label: 'Strawberry', param: 'flavor=Strawberry' },
          { label: 'Butterscotch', param: 'flavor=Butterscotch' },
          { label: 'Black Forest', param: 'flavor=Black Forest' },
        ]
      },
      {
        title: 'Delivery Cities',
        items: [
          { label: 'Gurgaon', param: 'deliveryCity=Gurgaon' },
          { label: 'Faridabad', param: 'deliveryCity=Faridabad' },
          { label: 'Ghaziabad', param: 'deliveryCity=Ghaziabad' },
          { label: 'Noida', param: 'deliveryCity=Noida' },
          { label: 'Delhi', param: 'deliveryCity=Delhi' },
        ]
      }
    ]
  },
  { name: 'Theme Cakes', href: '/cakes/search?category=Theme Cakes' },
  { name: 'By Relationship', href: '/cakes/search?category=By Relationship' },
  { name: 'Desserts', href: '/cakes/search?category=Desserts' },
  { name: 'Birthday', href: '/cakes/search?category=Birthday' },
  { name: 'Hampers', href: '/cakes/search?category=Hampers' },
  { name: 'Anniversary', href: '/cakes/search?category=Anniversary' },
  { name: 'Occasions', href: '/cakes/search?category=Occasions' },
  { name: 'Customized Cakes', href: '/cakes/search?category=Customized Cakes' },
];

export default function MainNavbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hideNavbar = useHideNavbar();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<CakeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cakes/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSearchInput = async (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/cakes/search?query=${encodeURIComponent(value)}`);
      const data = await response.json();
      setSearchSuggestions(data.cakes || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (cake: CakeSuggestion) => {
    setSearchQuery('');
    setShowSuggestions(false);
    // Use setTimeout to ensure state is updated before navigation
    setTimeout(() => {
      router.push(`/cakes/${cake.vendorId}/${cake.slug}`);
    }, 0);
  };

  const deliveryCities = ['Gurgaon', 'Faridabad', 'Ghaziabad', 'Noida', 'Delhi'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide navbar on vendor and admin dashboard routes
  const isVendorDashboard = pathname === '/vendor' || pathname.startsWith('/vendor/');
  const isAdminDashboard = pathname === '/admin' || pathname.startsWith('/admin/');
  
  if (isVendorDashboard || isAdminDashboard || hideNavbar) {
    return null;
  }
  
  // Show loading state navbar while session is loading
  if (status === 'loading') {
    // Return loading state navbar
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm animate-pulse">
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 border-b border-pink-800 h-20" />
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200 h-10" />
        <div className="border-b border-gray-200 h-16" />
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Top Search Bar with Logo and Actions */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 border-b border-pink-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-white hover:text-pink-100 transition-colors flex-shrink-0">
              <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <rect width="512" height="512" rx="110" fill="currentColor" opacity="0.2"/>
                <rect x="136" y="260" width="240" height="90" rx="24" fill="#F3E8FF"/>
                <rect x="168" y="200" width="176" height="70" rx="22" fill="#E9D5FF"/>
                <rect x="200" y="150" width="112" height="55" rx="18" fill="#F5F3FF"/>
                <path d="M168 200 Q190 215 212 200 Q234 215 256 200 Q278 215 300 200 Q322 215 344 200 L344 220 L168 220 Z" fill="#FAFAF8"/>
                <rect x="248" y="115" width="16" height="35" rx="8" fill="#FCA5A5"/>
                <circle cx="256" cy="105" r="10" fill="#FFFFFF"/>
                <rect x="110" y="260" width="50" height="100" rx="18" fill="#E9D5FF"/>
                <rect x="352" y="260" width="50" height="100" rx="18" fill="#E9D5FF"/>
                <circle cx="135" cy="300" r="8" fill="#F5F3FF"/>
                <circle cx="377" cy="300" r="8" fill="#F5F3FF"/>
              </svg>
              <span className="hidden sm:inline">Purblepalace</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} ref={searchFormRef} className="relative flex-1">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for cakes, flavours, types..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border border-pink-300 rounded-lg focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all text-sm md:text-base"
                />

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto pointer-events-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="inline-block animate-spin">⏳</div> Searching...
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <>
                        {searchSuggestions.slice(0, 8).map((cake) => (
                          <button
                            key={cake.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectSuggestion(cake);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">{cake.name}</p>
                              {cake.basePrice && (
                                <p className="text-sm text-gray-500">₹{Math.round(parseFloat(cake.basePrice.toString()))}</p>
                              )}
                            </div>
                            <Search className="w-4 h-4 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/cakes/search?query=${encodeURIComponent(searchQuery)}`);
                            setSearchQuery('');
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-3 text-center text-pink-600 font-medium hover:bg-pink-50 transition-colors cursor-pointer"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No cakes found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Track Order Button - Visible for all users */}
              <button
                onClick={() => router.push(session ? '/orders' : '/track-orders')}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white text-pink-600 rounded-lg hover:bg-pink-50 transition-all font-medium text-sm whitespace-nowrap border border-white hover:border-pink-600"
                title="Track your order"
              >
                <Package className="w-4 h-4" />
                <span>Track Order</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => router.push('/checkout')}
                className="flex items-center gap-2 px-3 py-2 bg-white text-pink-600 rounded-lg hover:bg-pink-50 transition-all font-medium text-sm whitespace-nowrap relative border border-white hover:border-pink-600"
                title={itemCount > 0 ? `View Cart (${itemCount} item${itemCount !== 1 ? 's' : ''})` : 'View Cart'}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden md:inline">
                  {itemCount > 0 ? `Cart (${itemCount})` : 'Cart'}
                </span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Become a Vendor Button */}
              <Link
                href="/auth/login?role=vendor"
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-medium text-sm whitespace-nowrap border border-orange-600 hover:border-orange-700"
                title="Become a vendor"
              >
                <span>Become Vendor</span>
              </Link>

              {/* Auth/Profile Button */}
              {session ? (
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-pink-600 rounded-lg hover:bg-pink-50 transition-all font-medium text-sm whitespace-nowrap border border-white hover:border-pink-600"
                  title="Go to profile"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/customer-login')}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-pink-600 rounded-lg hover:bg-pink-50 transition-all font-medium text-sm whitespace-nowrap border border-white hover:border-pink-600"
                  title="Login or Sign up"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-pink-600 flex-shrink-0" />
              <span className="font-medium">We deliver to:</span>
              <span className="text-xs sm:text-sm text-gray-600 truncate">{deliveryCities.slice(0, 3).join(', ')} & more</span>
            </div>
            <div className="flex items-center gap-4 text-gray-700">
              <button
                onClick={() => router.push(session ? '/orders' : '/track-orders')}
                className="flex items-center gap-2 hover:text-pink-600 transition-colors font-medium"
              >
                <Package className="w-4 h-4" />
                <span>Track Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(category.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {category.submenu ? (
                    <>
                      <button className="text-gray-700 font-medium px-4 py-2 rounded hover:text-pink-600 transition-colors flex items-center gap-1 group-hover:text-pink-600">
                        {category.name}
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute left-0 mt-0 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 top-full py-4 min-w-max z-50">
                        <div className="grid grid-cols-4 gap-6 px-6">
                          {category.submenu.map((section) => (
                            <div key={section.title}>
                              <h3 className="text-sm font-bold text-gray-900 mb-3 text-pink-600">{section.title}</h3>
                              <ul className="space-y-2">
                                {section.items.map((item) => (
                                  <li key={item.label}>
                                    <Link
                                      href={`/cakes/search?${item.param}`}
                                      className="text-sm text-gray-700 hover:text-pink-600 hover:font-semibold transition-all block"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={category.href!}
                      className="text-gray-700 font-medium px-4 py-2 rounded hover:text-pink-600 transition-colors whitespace-nowrap"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-pink-600 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-gray-50 px-4 py-4 max-h-96 overflow-y-auto">
              {/* Mobile Quick Actions */}
              <div className="flex gap-2 mb-4 pb-4 border-b border-gray-200">
                <button
                  onClick={() => {
                    router.push('/checkout');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm relative"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    router.push('/track-orders');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm"
                >
                  <Package className="w-4 h-4" />
                  Track
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {categories.map((category) => (
                  <div key={category.name}>
                    {category.submenu ? (
                      <div className="py-2">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === category.name ? null : category.name)}
                          className="w-full text-left text-gray-700 font-medium py-2 px-2 rounded hover:bg-gray-100 flex items-center justify-between"
                        >
                          {category.name}
                          <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === category.name ? 'rotate-180' : ''}`} />
                        </button>

                        {activeDropdown === category.name && (
                          <div className="bg-white border border-gray-200 rounded mt-2 p-3 ml-2">
                            {category.submenu.map((section) => (
                              <div key={section.title} className="mb-3">
                                <h4 className="text-xs font-bold text-pink-600 mb-2">{section.title}</h4>
                                <div className="space-y-1">
                                  {section.items.map((item) => (
                                    <Link
                                      key={item.label}
                                      href={`/cakes/search?${item.param}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block text-sm text-gray-700 hover:text-pink-600 py-1 px-2 rounded hover:bg-gray-100 transition-colors"
                                    >
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={category.href!}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-gray-700 font-medium py-2 px-2 rounded hover:bg-gray-100 hover:text-pink-600 transition-all block"
                      >
                        {category.name}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile Buttons */}
                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                  {/* Become a Vendor Button */}
                  <Link
                    href="/auth/login?role=vendor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-semibold w-full"
                  >
                    Become Vendor
                  </Link>

                  {/* Profile Button */}
                  {session ? (
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all font-semibold w-full"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        router.push('/auth/customer-login');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all font-semibold"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
