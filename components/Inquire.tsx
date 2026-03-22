"use client";

import { motion } from "framer-motion";

export default function Inquire() {
  return (
    <section className="horizontal-section h-screen w-[calc(100vw-5rem)] shrink-0 relative flex items-center justify-center p-24">
      <div className="text-center max-w-2xl">
        <h2 className="font-heading text-[5rem] leading-none mb-8 text-on-surface">
          Own The <br /> Ocean
        </h2>
        <p className="text-on-surface-variant mb-12">
          Production is limited to 3 hulls per year. Contact our brokerage team to reserve your build slot and begin the customization process.
        </p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-metallic text-background px-12 py-5 rounded text-sm tracking-widest uppercase font-semibold"
        >
          Inquire Now
        </motion.button>
      </div>
    </section>
  );
}
