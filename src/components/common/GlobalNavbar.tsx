'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';

export default function GlobalNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

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
              onClick={() => {
                const authModal = document.getElementById('auth-modal');
                if (authModal) authModal.style.display = 'block';
              }}
              className="bg-white text-black px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-gray-100 transition-colors"
            >
              Login / Sign Up
            </button>
          )}
        </nav>
      </>
    );
  }

  // For other pages, show a simpler navbar
  return (
    <nav ref={navRef} className="fixed top-0 w-full z-50 bg-white border-b border-[#1a1a1a]/10 flex justify-between items-center px-6 py-4">
      {/* Logo */}
      <button onClick={() => router.push('/')} className="serif text-2xl font-bold text-[#1a1a1a]">
        SAVOR
      </button>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-10 text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a]">
        <button onClick={() => router.push('/')} className="hover:text-[#F7E47D] transition-colors">
          Home
        </button>
        <button onClick={() => router.push('/cakes')} className="hover:text-[#F7E47D] transition-colors">
          Cakes
        </button>
        <button onClick={() => router.push('/orders')} className="hover:text-[#F7E47D] transition-colors">
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
            onClick={() => router.push('/')}
            className="bg-[#1a1a1a] text-[#F7E47D] px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest hover:shadow-lg transition-all"
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}
