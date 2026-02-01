'use client';

import Link from 'next/link';
import { User, Home, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
  {
    name: 'Cakes',
    submenu: [
      { name: 'Trending Cakes', items: ['Ribbon Cakes', 'Fresh Drops', 'Gourmet Cakes', 'Bento Cakes', 'Camera Cakes', 'Anime Cakes', 'Labubu Cakes', 'Cricket Cakes', 'Pinata Cakes', 'Drip Cakes'] },
      { name: 'By Type', items: ['Bestsellers', 'Eggless Cakes', 'Photo Cakes', 'Cheese Cakes', 'Half Cakes', 'Heart Shaped Cakes', 'Rose Cakes', 'All Cakes'] },
      { name: 'By Flavours', items: ['Chocolate Cakes', 'Butterscotch Cakes', 'Strawberry Cakes', 'Pineapple Cakes', 'Kit Kat Cakes', 'Black Forest Cakes', 'Red Velvet Cakes', 'Vanilla Cakes', 'Fruit Cakes', 'Blueberry Cakes'] },
      { name: 'Delivery Cities', items: ['Cakes To Bangalore', 'Cakes To Delhi', 'Cakes To Gurgaon', 'Cakes To Hyderabad', 'Cakes To Noida', 'Cakes To Mumbai', 'Cakes To Jaipur', 'Cakes To Pune', 'Cakes To Chandigarh', 'Cakes To Chennai'] },
    ]
  },
  { name: 'Theme Cakes', href: '/cakes/search?category=Theme%20Cakes' },
  { name: 'By Relationship', href: '/cakes/search?category=By%20Relationship' },
  { name: 'Desserts', href: '/cakes/search?category=Desserts' },
  { name: 'Birthday', href: '/cakes/search?category=Birthday' },
  { name: 'Hampers', href: '/cakes/search?category=Hampers' },
  { name: 'Anniversary', href: '/cakes/search?category=Anniversary' },
  { name: 'Occasions', href: '/cakes/search?category=Occasions' },
  { name: 'Customized Cakes', href: '/cakes/search?category=Customized%20Cakes' },
];

const getCakeTypeParam = (itemName: string): string => {
  // Special case for "All Cakes"
  if (itemName === 'All Cakes') {
    return '/cakes/search?category=Cakes';
  }

  const trendingCakes = ['Ribbon Cakes', 'Fresh Drops', 'Gourmet Cakes', 'Bento Cakes', 'Camera Cakes', 'Anime Cakes', 'Labubu Cakes', 'Cricket Cakes', 'Pinata Cakes', 'Drip Cakes'];
  const byType = ['Bestsellers', 'Eggless Cakes', 'Photo Cakes', 'Cheese Cakes', 'Half Cakes', 'Heart Shaped Cakes', 'Rose Cakes'];
  const byFlavour = ['Chocolate Cakes', 'Butterscotch Cakes', 'Strawberry Cakes', 'Pineapple Cakes', 'Kit Kat Cakes', 'Black Forest Cakes', 'Red Velvet Cakes', 'Vanilla Cakes', 'Fruit Cakes', 'Blueberry Cakes'];
  const deliveryCities = ['Cakes To Bangalore', 'Cakes To Delhi', 'Cakes To Gurgaon', 'Cakes To Hyderabad', 'Cakes To Noida', 'Cakes To Mumbai', 'Cakes To Jaipur', 'Cakes To Pune', 'Cakes To Chandigarh', 'Cakes To Chennai'];

  if (trendingCakes.includes(itemName)) return `/cakes/search?cakeType=${encodeURIComponent(itemName)}`;
  if (byType.includes(itemName)) return `/cakes/search?cakeType=${encodeURIComponent(itemName)}`;
  if (byFlavour.includes(itemName)) return `/cakes/search?flavor=${encodeURIComponent(itemName.replace(' Cakes', ''))}`;
  if (deliveryCities.includes(itemName)) {
    const city = itemName.replace('Cakes To ', '');
    return `/cakes/search?deliveryCity=${encodeURIComponent(city)}`;
  }
  
  return `/cakes/search?category=${encodeURIComponent(itemName)}`;
};

export default function TopNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-3">
          {/* Logo/Home */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-pink-600 hover:text-pink-700 transition-colors shrink-0">
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Bakingo Cakes</span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login?role=vendor"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
            >
              <span>Become a Vendor</span>
            </Link>

            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-700 font-medium hover:text-pink-600 px-3 py-2 rounded transition-colors flex items-center gap-1"
            >
              Menu
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex gap-1 text-sm overflow-x-auto">
          {menuItems.map((item) => (
            item.submenu ? (
              <div key={item.name} className="relative group">
                <button className="text-gray-700 font-medium hover:text-pink-600 px-3 py-2 rounded transition-colors flex items-center gap-1 whitespace-nowrap">
                  {item.name}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Multi-column Dropdown */}
                <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 top-full p-6 w-screen max-w-6xl z-[9999]" style={{ left: '-50vw', width: '100vw' }}>
                  <div className="grid grid-cols-4 gap-4">
                    {item.submenu.map((section) => (
                      <div key={section.name}>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">⭐</span>
                          {section.name}
                        </h4>
                        <ul className="space-y-2">
                          {section.items.map((subitem) => (
                            <li key={subitem}>
                              <Link
                                href={getCakeTypeParam(subitem)}
                                className="text-gray-700 text-sm hover:text-pink-600 hover:font-semibold transition-colors block"
                              >
                                {subitem}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href!}
                className="text-gray-700 font-medium hover:text-pink-600 px-3 py-2 rounded transition-colors whitespace-nowrap"
              >
                {item.name}
                {item.name === 'Hampers' && <span className="ml-1 text-xs bg-pink-600 text-white px-2 py-1 rounded-full font-bold">New</span>}
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-50 border-t border-gray-200 px-4 py-4 max-h-96 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              item.submenu ? (
                <div key={item.name}>
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.name ? null : item.name)}
                    className="w-full text-left text-gray-700 font-medium hover:text-pink-600 py-2 px-2 rounded transition-colors flex items-center justify-between"
                  >
                    {item.name}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenu === item.name ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedMenu === item.name && (
                    <div className="bg-white border border-gray-200 rounded mt-2 p-3 ml-2">
                      {item.submenu.map((section) => (
                        <div key={section.name} className="mb-4">
                          <h5 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
                            <span>⭐</span>
                            {section.name}
                          </h5>
                          <div className="space-y-1">
                            {section.items.map((subitem) => (
                              <Link
                                key={subitem}
                                href={getCakeTypeParam(subitem)}
                                className="block text-xs text-gray-700 hover:text-pink-600 hover:font-semibold py-1 px-2 rounded"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subitem}
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
                  key={item.name}
                  href={item.href!}
                  className="text-gray-700 font-medium hover:text-pink-600 py-2 px-2 rounded transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Mobile Profile Button */}
            <Link
              href="/auth/login?role=vendor"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300 mt-4 font-semibold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Become a Vendor</span>
            </Link>

            {/* Mobile Profile Button */}
            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all duration-300 mt-2 font-semibold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
