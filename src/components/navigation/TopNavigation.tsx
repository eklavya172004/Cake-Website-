'use client';

import Link from 'next/link';
import { User, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopNavigation() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#FFF9EB] border-b border-[#1a1a1a]/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/Home */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <Home className="w-5 h-5" />
          <span className="hidden sm:inline">Cake Shop</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 text-sm">
          <Link href="/cakes" className="hover:text-[#F7E47D] transition-colors">
            Browse Cakes
          </Link>
          <Link href="/orders" className="hover:text-[#F7E47D] transition-colors">
            My Orders
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#F7E47D] rounded-full hover:bg-black transition-colors text-sm font-semibold"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">My Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
