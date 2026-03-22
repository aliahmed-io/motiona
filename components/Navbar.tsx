"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { scrollState } from "@/lib/store";

export default function Navbar() {
  const [lastSection, setLastSection] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSection(scrollState.progress >= 0.85);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 w-full z-100 transition-all duration-700 ${
        lastSection
          ? "bg-background/80 backdrop-blur-2xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-8 lg:px-20">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="w-full h-full border border-primary/60 rotate-45 group-hover:rotate-[55deg] transition-transform duration-700" />
              <span className="absolute text-primary font-heading italic text-xs leading-none">R</span>
            </div>
            <span className="font-heading text-lg tracking-[0.35em] text-on-surface uppercase">
              Abyssal
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {["Fleet", "Heritage", "Bespoke", "Brokerage"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <Link
                  href={`#${item.toLowerCase()}`}
                  className="text-on-surface/70 hover:text-primary transition-colors duration-300 text-[10px] uppercase tracking-[0.25em] font-medium relative group"
                >
                  {item}
                  <span className="absolute -bottom-px left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-500" />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button className="hidden md:block text-[10px] font-medium text-on-surface/50 hover:text-on-surface transition-colors uppercase tracking-[0.25em]">
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-primary text-background px-7 py-3 text-[9px] uppercase tracking-[0.3em] font-medium hover:bg-accent transition-colors duration-300 rounded-none"
            >
              Inquire
            </motion.button>
          </div>

        </div>
      </div>
    </motion.header>
  );
}

