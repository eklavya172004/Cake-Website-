'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleAuthClick = () => {
    console.log('Auth button clicked, current state:', authModalOpen);
    setAuthModalOpen(true);
    console.log('Auth modal state should be true now');
  };

  return (
    <>
      <nav className="fixed  top-0 w-full z-50 bg-white border-b border-[#1a1a1a]/10 flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <button onClick={() => router.push('/')} className="serif text-2xl font-bold text-[#1a1a1a]">
          SAVOR
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-10 text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a]">
          <button onClick={() => router.push('/')} className="hover:text-[#F7E47D] transition-colors">
            Home
          </button>
          <a href="/#catalog" className="hover:text-[#F7E47D] transition-colors">
            Cakes
          </a>
          <button onClick={() => router.push('/orders')} className="hover:text-[#F7E47D] transition-colors">
            Orders
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {session ? (
            <button
              onClick={() => router.push('/profile')}
              className="hidden md:inline bg-[#1a1a1a] text-[#F7E47D] px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest hover:shadow-lg transition-all"
            >
              My Profile
            </button>
          ) : (
            <button
              onClick={handleAuthClick}
              className="hidden md:inline bg-[#1a1a1a] text-[#F7E47D] px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest hover:shadow-lg transition-all"
            >
              Login / Sign Up
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-[#FFF9EB] rounded transition-colors"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-[#1a1a1a]" />
            ) : (
              <Menu className="w-6 h-6 text-[#1a1a1a]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-[#1a1a1a]/10 md:hidden">
          <div className="flex flex-col space-y-4 px-6 py-4">
            <button
              onClick={() => {
                router.push('/');
                setMenuOpen(false);
              }}
              className="text-[#1a1a1a] hover:text-[#F7E47D] transition-colors py-2"
            >
              Home
            </button>
            <a
              href="/#catalog"
              onClick={() => setMenuOpen(false)}
              className="text-[#1a1a1a] hover:text-[#F7E47D] transition-colors py-2"
            >
              Cakes
            </a>
            <button
              onClick={() => {
                router.push('/orders');
                setMenuOpen(false);
              }}
              className="text-[#1a1a1a] hover:text-[#F7E47D] transition-colors py-2"
            >
              Orders
            </button>
            <hr className="border-[#1a1a1a]/10" />
            {session ? (
              <button
                onClick={() => {
                  router.push('/profile');
                  setMenuOpen(false);
                }}
                className="bg-[#1a1a1a] text-[#F7E47D] px-4 py-2 rounded-full text-sm font-bold uppercase w-full"
              >
                My Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  handleAuthClick();
                  setMenuOpen(false);
                }}
                className="bg-[#1a1a1a] text-[#F7E47D] px-4 py-2 rounded-full text-sm font-bold uppercase w-full"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
