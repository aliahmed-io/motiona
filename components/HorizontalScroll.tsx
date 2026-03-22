"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "./Scene";
import { scrollState } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(".horizontal-section");
      
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          start: "top top",
          end: () => `+=${containerRef.current?.offsetWidth || 0}`,
          onUpdate: (self) => {
            scrollState.progress = self.progress;
          },
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <Scene />
      </div>
      <div ref={containerRef} className="h-screen w-[500vw] flex overflow-hidden">
        {children}
      </div>
    </>
  );
}
