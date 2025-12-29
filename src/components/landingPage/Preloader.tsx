"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const counterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const count = { val: 0 };
    
    const tl = gsap.timeline({
      onComplete: () => {
        // Curtain effect
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
          onComplete: onComplete
        });
      }
    });

    tl.to(count, {
      val: 100,
      duration: 2.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.innerText = Math.floor(count.val)
            .toString()
            .padStart(2, '0');
        }
      }
    });
  }, [onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#FFF9EB]"
    >
      <div 
        ref={counterRef} 
        className="text-[8vw] font-light tracking-tighter text-[#1a1a1a]"
      >
        00
      </div>
    </div>
  );
}