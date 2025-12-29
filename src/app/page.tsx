"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Preloader from "@/components/landingPage/Preloader";
import HorizontalScroll from "@/components/landingPage/HorizontalScroll";
import Marketplace from "@/components/landingPage/Marketplace";
import AuthModal from "@/components/auth/AuthModal";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const heroTextRef = useRef<HTMLDivElement>(null);

  const handleLoaderComplete = () => {
    setLoading(false);
    // Reveal Hero Text Animation
    gsap.to(heroTextRef.current, { 
      y: 0, 
      opacity: 1, 
      duration: 1, 
      ease: "power4.out",
      delay: 0.2
    });
  };

  return (
    <main className={`relative ${loading ? 'overflow-hidden h-screen' : 'overflow-auto'}`}>
      <Preloader onComplete={handleLoaderComplete} />

      {/* Grain Overlay */}
      <svg className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] opacity-[0.05]">
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#noise)"/>
      </svg>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center px-6 overflow-hidden bg-black">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover brightness-[0.7]">
            <source src="/video/1292748-hd_1920_1080_30fps.mp4" type="video/mp4" />
          </video>
        </div>
        <div ref={heroTextRef} className="relative z-20 text-white opacity-0 translate-y-12">
          <h1 className="serif text-7xl md:text-[11rem] leading-[0.8] mb-8 drop-shadow-2xl">Purble <br /><em>Palace</em></h1>
          <p className="max-w-md mx-auto text-lg opacity-90 font-light drop-shadow-md">Custom cakes crafted by elite cloud kitchens. Bidding starts now.</p>
        </div>
      </section>

      <div className="bg-[#F7E47D] p-3 text-center text-[10px] uppercase tracking-widest font-bold sticky top-0 z-40">
        Now serving: North Delhi, Gurgaon, Noida & More.
      </div>

      <HorizontalScroll />

      <div id="catalog">
        <Marketplace />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </main>
  );
}
