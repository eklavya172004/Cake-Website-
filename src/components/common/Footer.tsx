'use client';

import { useLayoutEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Staggered letter reveal - ONLY when brandRef enters viewport
      const letters = brandRef.current?.querySelectorAll('.letter');
      if (letters && letters.length > 0) {
        gsap.fromTo(letters, 
          {
            y: "110%", // Start well below the "floor"
            opacity: 0,
            rotateX: 60 // Premium Rejouice tilt
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.2,
            stagger: 0.04,
            ease: "power4.out",
            scrollTrigger: {
              trigger: brandRef.current, // Trigger ONLY on the text container
              start: "top 95%",          // Start when the top of the text is near bottom of screen
              end: "bottom 80%",
              toggleActions: "play none none reverse", // Plays only when scrolling down into it
              // markers: true, // Use this to debug the trigger lines
            }
          }
        );
      }

      // 2. Continuous horizontal sway (only active after letters reveal)
      if (brandRef.current) {
        gsap.to(brandRef.current, {
          x: -100,
          duration: 10,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // 3. Staggered fade in for the footer columns
      gsap.from(".footer-animate-item", {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%", // Triggers when the footer section is visible
        }
      });
    }, footerRef);

    // Refresh after a delay to ensure full page height is calculated
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  return (
    <footer ref={footerRef} className="bg-[#1a1a1a] text-[#F7E47D] mt-16 relative">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          <div className="footer-animate-item">
            <h3 className="serif text-3xl font-bold mb-4">PURPLE PALACE</h3>
            <p className="text-[#F7E47D]/70 text-sm mb-4">
              Crafting premium custom cakes and delightful memories. Artistic designs meet unforgettable flavors.
            </p>
            <div className="flex gap-4">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          <div className="footer-animate-item">
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Navigation</h4>
            <ul className="space-y-2 text-sm text-[#F7E47D]/70">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/catalog" className="hover:text-white transition-colors">Cake Gallery</a></li>
              <li><a href="/orders" className="hover:text-white transition-colors">Track Order</a></li>
            </ul>
          </div>

          <div className="footer-animate-item">
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Legal</h4>
            <ul className="space-y-2 text-sm text-[#F7E47D]/70">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-animate-item">
            <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-[#F7E47D]/70">
              <li className="flex gap-3"><Phone className="w-5 h-5" /> +91 9876-543-210</li>
              <li className="flex gap-3"><Mail className="w-5 h-5" /> hello@purplepalace.com</li>
              <li className="flex gap-3"><MapPin className="w-5 h-5" /> New Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#F7E47D]/20 pt-8 flex justify-between items-center footer-animate-item">
          <p className="text-[#F7E47D]/70 text-sm">© {currentYear} PURPLE PALACE. All rights reserved.</p>
        </div>
      </div>

      {/* THE REJOUICE-STYLE BIG REVEAL SECTION */}
      <div className="w-full overflow-hidden bg-[#1a1a1a] pb-10 pt-4">
        <div className="overflow-hidden">
          <h1 
            ref={brandRef}
            className="text-[15.5vw] leading-[0.8] font-bold text-center select-none tracking-tighter whitespace-nowrap"
            style={{ willChange: 'transform' }}
          >
            {'PURPLE PALACE'.split('').map((char, i) => (
              <span 
                key={i} 
                className="letter inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>
      </div>

      <style jsx>{`
        /* Hide letters initially so they don't flash on top of the page */
        .letter {
          transform: translateY(110%);
          opacity: 0;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
      `}</style>
    </footer>
  );
}