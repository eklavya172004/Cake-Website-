'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface OrderPreloaderProps {
  onComplete: () => void;
}

export default function OrderPreloader({ onComplete }: OrderPreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: onComplete
    });

    // Animate the loading text
    tl.to(textRef.current, {
      opacity: 0.5,
      yoyo: true,
      repeat: -1,
      duration: 1,
      ease: 'sine.inOut'
    });

    // After 3 seconds, start the exit animation
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      delay: 3,
      onComplete: onComplete,
      pointerEvents: 'none'
    });
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#FFF9EB] transition-opacity"
    >
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#1a1a1a] border-t-[#F7E47D]"></div>
        </div>
        <div ref={textRef} className="serif text-2xl text-[#1a1a1a]">
          Fetching Order Details...
        </div>
      </div>
    </div>
  );
}
