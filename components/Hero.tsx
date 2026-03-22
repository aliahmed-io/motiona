"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="horizontal-section h-screen w-[calc(100vw-5rem)] shrink-0 relative flex items-center justify-between p-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10 bg-surface">
         <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10" />
         {/* The actual image will be placed here via props or an img tag */}
         <img src="/yacht_exterior.png" alt="Yacht Exterior" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
      </div>

      <div className="z-20 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-primary tracking-[0.2em] uppercase text-sm font-semibold mb-6"
        >
          Project 001
        </motion.p>
        
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="font-heading text-[6rem] leading-[0.9] text-on-surface mb-8 -tracking-widest"
        >
          ABYSSAL <br /> ELEGANCE
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <button className="glass px-8 py-4 rounded text-sm tracking-widest uppercase hover:bg-surface-variant/80 transition-all duration-300">
            Scroll to Explore
          </button>
        </motion.div>
      </div>
    </section>
  );
}
