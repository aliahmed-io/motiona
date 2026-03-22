"use client";

import HorizontalScroll from "@/components/HorizontalScroll";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

/* ─── Animation Variants ─────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const lineReveal: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as [number,number,number,number] },
  },
};

/* ─── Shared Label Component ─────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
      <span className="block w-6 h-px bg-primary" />
      <span className="text-primary text-[10px] tracking-[0.3em] uppercase font-medium">
        {children}
      </span>
    </motion.div>
  );
}

/* ─── Scroll Progress ─────────────────────────────────────── */
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (barRef.current) {
          barRef.current.style.width = `${self.progress * 100}%`;
        }
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-px z-9999 bg-white/5">
      <div
        ref={barRef}
        className="h-full"
        style={{
          background: "linear-gradient(90deg, #C9A96E, #8FB8C4)",
          width: "0%",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

/* ─── Scroll-Down Indicator (Hero only, auto-hides) ──────── */
function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(scrollState.progress < 0.03);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none"
    >
      <span className="text-[8px] tracking-[0.4em] uppercase text-on-surface/40 font-medium">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="15" height="23" rx="7.5" stroke="rgba(201,169,110,0.3)" />
          <motion.circle
            cx="8" cy="8" r="2"
            fill="rgba(201,169,110,0.7)"
            animate={{ cy: [6, 14, 6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* ─── Section Navigation Dots (clickable) ────────────────── */
function SectionDots() {
  const [active, setActive] = useState(0);
  const labels = ["Hero", "Exterior", "Power", "Interior", "Contact"];

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.round(scrollState.progress * 4);
      setActive(idx);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (index / 4) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, []);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-90 flex flex-col items-end gap-4">
      {labels.map((label, i) => (
        <button
          key={label}
          onClick={() => scrollToSection(i)}
          className="flex items-center gap-3 group cursor-pointer bg-transparent border-none p-0"
          aria-label={`Go to ${label} section`}
        >
          <span
            className={`text-[8px] tracking-[0.25em] uppercase transition-all duration-500 ${
              active === i ? "opacity-100 text-primary translate-x-0" : "opacity-0 group-hover:opacity-60 text-on-surface translate-x-2 group-hover:translate-x-0"
            }`}
          >
            {label}
          </span>
          <span
            className={`block rounded-full transition-all duration-500 ${
              active === i
                ? "w-2.5 h-2.5 bg-primary shadow-[0_0_8px_rgba(201,169,110,0.5)]"
                : "w-1.5 h-1.5 bg-on-surface/25 group-hover:bg-on-surface/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Cursor Follower (respects prefers-reduced-motion) ─── */
function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    setEnabled(true);
  }, []);

  const onMove = useCallback((e: MouseEvent) => {
    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    }
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        x: e.clientX - 16,
        y: e.clientY - 16,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [onMove, enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full z-200 pointer-events-none mix-blend-difference hidden lg:block"
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border border-primary/30 rounded-full z-199 pointer-events-none mix-blend-difference hidden lg:block"
      />
    </>
  );
}

/* ─── Stat Card ───────────────────────────────────────────── */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-none border-l-2 border-l-primary/50 border-t-0 border-r-0 border-b-0 p-6 group hover:bg-white/6 transition-colors duration-500">
      <p className="text-[9px] tracking-[0.35em] text-on-surface-variant uppercase mb-3">{label}</p>
      <p className="text-4xl lg:text-5xl font-heading text-gold leading-none">{value}</p>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <CursorFollower />
      <SectionDots />
      <ScrollProgress />
      <HorizontalScroll>

        {/* ——— 01 · HERO ——————————————————————————————————— */}
        <section
          id="hero"
          className="horizontal-section h-[100svh] w-screen shrink-0 flex items-end pb-[10vh] px-8 lg:px-20 relative overflow-hidden"
        >
          {/* section counter */}
          <span className="absolute top-32 right-10 text-[9px] tracking-[0.4em] text-on-surface-variant/50 uppercase rotate-90 origin-right">
            01 / 05
          </span>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-5xl w-full relative z-10 pointer-events-auto"
          >
            <SectionLabel>Riva Aquarama — 2027 Edition</SectionLabel>

            <div className="overflow-hidden">
              <motion.h1
                variants={fadeUp}
                className="font-heading text-[clamp(4rem,12vw,11rem)] leading-[0.82] text-on-surface tracking-tight"
              >
                Born from
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                variants={fadeUp}
                className="font-heading italic text-[clamp(4rem,12vw,11rem)] leading-[0.82] text-gold tracking-tight"
              >
                the Sea
              </motion.h1>
            </div>

            <motion.div variants={lineReveal} className="h-px bg-primary/25 my-9 max-w-2xl" />

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <motion.p
                variants={fadeUp}
                className="text-on-surface-mid max-w-sm text-sm md:text-base leading-loose tracking-wide font-light"
              >
                A vessel that does not merely sail — it transcends. Classical wood craftsmanship reborn
                for an age that demands both beauty and absolute silence.
              </motion.p>

              <motion.div variants={fadeUp} className="flex items-center gap-8">
                <button
                  className="group flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-on-surface-mid hover:text-primary transition-colors duration-300"
                >
                  <span className="block w-8 h-px bg-current transition-all group-hover:w-14 duration-500" />
                  Explore Vessel
                </button>
                <button
                  className="bg-primary text-on-primary px-8 py-4 text-[10px] tracking-[0.3em] uppercase font-medium hover:bg-accent transition-colors duration-300 rounded-none"
                >
                  Inquire Now
                </button>
              </motion.div>
            </div>
          </motion.div>

          <ScrollIndicator />
        </section>

        {/* ——— 02 · EXTERIOR ——————————————————————————————— */}
        <section
          id="exterior"
          className="horizontal-section h-[100svh] w-screen shrink-0 flex items-center justify-end px-8 lg:px-20 relative overflow-hidden"
        >
          <span className="absolute top-32 right-10 text-[9px] tracking-[0.4em] text-on-surface-variant/50 uppercase rotate-90 origin-right">
            02 / 05
          </span>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-lg w-full text-right relative z-10 pointer-events-auto"
          >
            <SectionLabel>Exterior Mastery</SectionLabel>

            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp} className="font-heading text-[clamp(3rem,8vw,7rem)] leading-[0.85] text-on-surface">
                Sculpted
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp} className="font-heading italic text-[clamp(3rem,8vw,7rem)] leading-[0.85] text-gold">
                by Wind
              </motion.h2>
            </div>

            <motion.div variants={lineReveal} className="h-px bg-primary/25 my-8 ml-auto max-w-xs" />

            <motion.p variants={fadeUp} className="text-on-surface-mid text-sm leading-loose font-light tracking-wide">
              Hand-laid mahogany over a carbon-fibre core. The hull draws a razor silhouette at 38 knots —
              each plank a note in a century-long tradition of Italian boatbuilding.
            </motion.p>

            {/* Feature pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mt-8 justify-end">
              {["Carbon Fibre Hull", "Hand-Laid Mahogany", "Racing Pedigree"].map((f) => (
                <span
                  key={f}
                  className="text-[9px] tracking-[0.2em] uppercase text-primary border border-primary/30 px-4 py-2"
                >
                  {f}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ——— 03 · POWER ——————————————————————————————————— */}
        <section
          id="power"
          className="horizontal-section h-[100svh] w-screen shrink-0 flex items-center px-8 lg:px-20 relative overflow-hidden"
        >
          <span className="absolute top-32 right-10 text-[9px] tracking-[0.4em] text-on-surface-variant/50 uppercase rotate-90 origin-right">
            03 / 05
          </span>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-xl w-full relative z-10 pointer-events-auto"
          >
            <SectionLabel>Engineering Marvel</SectionLabel>

            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp} className="font-heading text-[clamp(3rem,8vw,7rem)] leading-[0.85] text-on-surface">
                Absolute
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp} className="font-heading italic text-[clamp(3rem,8vw,7rem)] leading-[0.85] text-gold">
                Power
              </motion.h2>
            </div>

            <motion.div variants={lineReveal} className="h-px bg-primary/25 my-8 max-w-xs" />

            {/* Stats Grid */}
            <motion.div variants={stagger} className="grid grid-cols-2 gap-4 mt-6">
              <motion.div variants={fadeUp}><StatCard label="Top Speed" value="38 kn" /></motion.div>
              <motion.div variants={fadeUp}><StatCard label="Max Range" value="4,500 nm" /></motion.div>
              <motion.div variants={fadeUp}><StatCard label="Twin Engines" value="2 × 950 hp" /></motion.div>
              <motion.div variants={fadeUp}><StatCard label="Displacement" value="28 t" /></motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ——— 04 · INTERIOR ———————————————————————————————— */}
        <section
          id="interior"
          className="horizontal-section h-[100svh] w-screen shrink-0 flex items-center justify-end px-8 lg:px-20 relative overflow-hidden"
        >
          <span className="absolute top-32 right-10 text-[9px] tracking-[0.4em] text-on-surface-variant/50 uppercase rotate-90 origin-right">
            04 / 05
          </span>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-lg w-full text-right relative z-10 pointer-events-auto"
          >
            <SectionLabel>Bespoke Comfort</SectionLabel>

            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp} className="font-heading text-[clamp(3rem,8vw,7rem)] leading-[0.85] text-on-surface">
                Inner
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp} className="font-heading italic text-[clamp(3rem,8vw,7rem)] leading-[0.85] text-gold">
                Sanctuary
              </motion.h2>
            </div>

            <motion.div variants={lineReveal} className="h-px bg-primary/25 my-8 ml-auto max-w-xs" />

            <motion.p variants={fadeUp} className="text-on-surface-mid text-sm leading-loose font-light tracking-wide">
              Venetian Travertine, book-matched walnut burl, and hand-stitched Hermès leather.
              A cabin that whispers — not merely a cabin, but a private estate upon the sea.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mt-8 justify-end">
              {["Italian Marble", "Silent Cruising", "Bespoke Audio", "Climate Control"].map((f) => (
                <span
                  key={f}
                  className="text-[9px] tracking-[0.2em] uppercase text-primary border border-primary/30 px-4 py-2"
                >
                  {f}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ——— 05 · CONTACT ————————————————————————————————— */}
        <section
          id="contact"
          className="horizontal-section h-[100svh] w-screen shrink-0 flex items-center justify-center text-center px-8 lg:px-20 relative overflow-hidden"
        >
          <span className="absolute top-32 right-10 text-[9px] tracking-[0.4em] text-on-surface-variant/50 uppercase rotate-90 origin-right">
            05 / 05
          </span>

          {/* Ambient ring */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)",
            }}
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="relative z-10 pointer-events-auto flex flex-col items-center"
          >
            <SectionLabel>2027 Build Allocation</SectionLabel>

            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp} className="font-heading text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-on-surface">
                Commission
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2 variants={fadeUp} className="font-heading italic text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] text-gold mb-6">
                Your Legacy
              </motion.h2>
            </div>

            <motion.div variants={lineReveal} className="h-px bg-primary/40 my-6 w-24" />

            <motion.p
              variants={fadeUp}
              className="text-on-surface-mid text-sm max-w-md leading-loose font-light tracking-wide mb-12"
            >
              Only nine hulls will be built annually. Begin your personalisation journey with
              our bespoke commission studio — crafted to your waters, your identity.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 items-center">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "#E8D5B0" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="bg-primary text-background px-12 py-5 text-[10px] tracking-[0.35em] uppercase font-medium hover:bg-accent transition-colors rounded-none"
              >
                Commission Now
              </motion.button>
              <motion.button
                whileHover={{ color: "#C9A96E" }}
                className="text-on-surface-mid text-[10px] tracking-[0.35em] uppercase font-medium flex items-center gap-3 group transition-colors"
              >
                <span className="block w-6 h-px bg-current group-hover:w-12 transition-all duration-500" />
                Download Prospectus
              </motion.button>
            </motion.div>


          </motion.div>
        </section>

      </HorizontalScroll>
    </>
  );
}
