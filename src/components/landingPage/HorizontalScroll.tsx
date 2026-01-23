"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HorizontalScroll() {
  const component = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray(".panel");
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: slider.current,
          pin: true,
          scrub: 1,
          end: () => "+=" + slider.current?.offsetWidth,
        }
      });
    }, component);
    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-hidden" ref={component}>
      <div ref={slider} className="flex w-[300vw] h-screen">
        <section className="panel w-screen h-screen flex items-center px-[10vw] bg-[#1a1a1a] text-white">
          <div className="grid md:grid-cols-2 gap-10">
            <h2 className="serif text-6xl md:text-8xl italic">01. <br />Customize</h2>
            <p className="text-xl opacity-60 self-center">See your design evolve as you choose flavors and toppings.</p>
          </div>
        </section>
        
        <section className="panel w-screen h-screen flex items-center px-[10vw] bg-[#F7E47D] text-black">
          <div className="grid md:grid-cols-2 gap-10">
            <h2 className="serif text-6xl md:text-8xl italic">02. <br />Generate Cake</h2>
            <p className="text-xl opacity-80 self-center">See how your cake will look after customization through AI.</p>
          </div>
        </section>

        <section className="panel w-screen h-screen flex items-center px-[10vw] bg-white text-black">
          <div className="grid md:grid-cols-2 gap-10">
            <h2 className="serif text-6xl md:text-8xl italic">03. <br />Split</h2>
            <p className="text-xl opacity-80 self-center">Co-Pay with ease. Split payments instantly.</p>
          </div>
        </section>
      </div>
    </div>
  );
}