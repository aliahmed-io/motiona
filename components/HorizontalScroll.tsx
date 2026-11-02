"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CinematicScene from "./CinematicScene";
import { scrollState } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".horizontal-section", containerRef.current);
      
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        onUpdate: function () {
          scrollState.progress = this.progress();
          sections.forEach((section, index) => {
            const distance = Math.abs(this.progress() * (sections.length - 1) - index);
            section.inert = distance > 0.5;
            const t = Math.max(0, Math.min(1, (distance - 0.08) / 0.34));
            section.style.setProperty("--chapter-opacity", String(1 - t * t * (3 - 2 * t)));
            // Cancel the page-sized text slide; retain a quiet horizontal drift.
            const offset = this.progress() * (sections.length - 1) - index;
            section.style.setProperty("--chapter-counter", `${offset * (window.innerWidth - (reduced ? 0 : 38))}px`);
          });
        },
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: reduced ? true : 0.8,
          invalidateOnRefresh: true,
          start: "top top",
          end: () => `+=${window.innerWidth * (sections.length - 1)}`,
        },
      });
    }, containerRef);

    return () => { ctx.revert(); scrollState.progress = 0; };
  }, []);

  return (
    <>
      <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <CinematicScene />
      </div>
      <div ref={containerRef} className="relative z-10 h-[100svh] w-screen flex overflow-hidden">
        {children}
      </div>
    </>
  );
}
