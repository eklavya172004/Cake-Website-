'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';
import AuthModal from '@/components/auth/AuthModal';

export default function GlobalNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const handleAuthClick = () => {
    console.log('Auth button clicked, current state:', authModalOpen);
    setAuthModalOpen(true);
    console.log('Auth modal state should be true now');
  };

  // Animate navbar on mount
  useEffect(() => {
    // Only animate on landing page
    if (pathname === '/' && navRef.current) {
      gsap.to(navRef.current, { opacity: 1, duration: 0.5 });
    } else if (navRef.current) {
      // On other pages, make it visible immediately
      navRef.current.style.opacity = '1';
    }
  }, [pathname]);

  // Conditionally render based on route
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <>
        {/* Full Screen Menu */}
        <div
          className={`fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black text-white transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]`}
          style={{ clipPath: menuOpen ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
        >
          <button onClick={() => setMenuOpen(false)} className="absolute top-10 right-10 uppercase text-xs tracking-widest font-bold">
            Close —
          </button>
          <div className="flex flex-col space-y-2 text-center">
            {['Theme Cakes', 'Desserts', 'Hampers', 'Bidding Portal'].map((item) => (
              <div key={item} className="overflow-hidden">
                <a href="#" className="serif text-6xl md:text-8xl hover:text-[#F7E47D] transition-colors block">
                  {item}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav ref={navRef} className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-8 mix-blend-difference text-white opacity-0">
          <button onClick={() => router.push('/')} className="text-2xl font-bold tracking-tighter cursor-pointer hover:text-[#F7E47D] transition-colors">
            SAVOR
          </button>
          <div className="hidden md:flex space-x-10 text-[10px] uppercase tracking-widest font-bold">
            <button onClick={() => setMenuOpen(true)} className="hover:opacity-50">
              Menu +
            </button>
            <button onClick={() => router.push('/cakes')} className="hover:opacity-50">
              Cakes
            </button>
          </div>
          {session ? (
            <button
              onClick={() => router.push('/profile')}
              className="bg-white text-black px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-gray-100 transition-colors"
            >
              My Profile
            </button>
          ) : (
            <button
              onClick={handleAuthClick}
              className="bg-white text-black px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-gray-100 transition-colors"
            >
              Login / Sign Up
            </button>
          )}
        </nav>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }

  // For other pages, show a simpler navbar
  return (
    <nav ref={navRef} className="fixed top-0 w-full z-50 bg-gradient-to-r from-pink-600 to-pink-700 border-b border-pink-800 flex justify-between items-center px-6 py-4">
      {/* Logo */}
      <button onClick={() => router.push('/')} className="flex items-center gap-2 font-bold text-lg text-white hover:text-pink-100 transition-colors">
        <svg className="w-6 h-6" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
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
      </button>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-10 text-sm uppercase tracking-widest font-bold text-white">
        <button onClick={() => router.push('/')} className="hover:text-pink-100 transition-colors">
          Home
        </button>
        <button onClick={() => router.push('/cakes')} className="hover:text-pink-100 transition-colors">
          Cakes
        </button>
        <button onClick={() => router.push('/orders')} className="hover:text-pink-100 transition-colors">
          Orders
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {session ? (
          <button
            onClick={() => router.push('/profile')}
            className="bg-[#1a1a1a] text-[#F7E47D] px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest hover:shadow-lg transition-all"
          >
            My Profile
          </button>
        ) : (
          <button
            onClick={handleAuthClick}
            className="bg-[#1a1a1a] text-[#F7E47D] px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest hover:shadow-lg transition-all"
          >
            Login / Sign Up
          </button>
        )}
      </div>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </nav>
  );
}
