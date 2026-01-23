"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Cake, Pizza, Utensils, Coffee, Croissant, IceCream, Apple, Donut, Egg, ChefHat, Flame, Wine, Cookie, Sandwich } from "lucide-react";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [iconIndex, setIconIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const icons = [
    { Icon: Cake, label: "Cake" },
    { Icon: Pizza, label: "Pizza" },
    { Icon: Croissant, label: "Croissant" },
    { Icon: IceCream, label: "Ice Cream" },
    { Icon: Donut, label: "Donut" },
    { Icon: Coffee, label: "Coffee" },
    { Icon: Apple, label: "Apple" },
    { Icon: Egg, label: "Egg" },
    { Icon: ChefHat, label: "Chef" },
    { Icon: Utensils, label: "Utensils" },
    { Icon: Wine, label: "Wine" },
    { Icon: Cookie, label: "Cookie" },
    { Icon: Flame, label: "Flame" },
    { Icon: Sandwich, label: "Sandwich" }
  ];

  useEffect(() => {
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

    // Change icon every 100ms for 2.5 seconds (fast like numbers counting)
    const iconInterval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 100);

    // Clear interval after 2.5 seconds
    setTimeout(() => {
      clearInterval(iconInterval);
    }, 2500);

    return () => clearInterval(iconInterval);
  }, [onComplete, icons.length]);

  const CurrentIcon = icons[iconIndex].Icon;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#FFF9EB]"
    >
      <div className="animate-bounce">
        <CurrentIcon 
          size={80} 
          className="text-[#1a1a1a]"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}