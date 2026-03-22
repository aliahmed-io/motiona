"use client";

import { Compass, Ship, Anchor, Phone } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Sidebar() {
  return (
    <nav className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center justify-between py-10 z-50 glass border-r-0 border-y-0 text-on-surface">
      {/* Brand logo */}
      <Link href="/" className="font-heading text-2xl font-light tracking-widest -rotate-90 origin-center mt-12 block">
        O.
      </Link>

      {/* Nav links */}
      <ul className="flex flex-col gap-10">
        {[
          { icon: Compass, label: "Explore" },
          { icon: Ship, label: "Models" },
          { icon: Anchor, label: "Technical" },
        ].map((item, idx) => (
          <li key={idx} className="relative group cursor-pointer flex justify-center">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <item.icon className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
            </motion.div>
          </li>
        ))}
      </ul>

      {/* Contact CTA */}
      <div className="relative group cursor-pointer">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="bg-gradient-metallic p-3 rounded-full text-background">
          <Phone className="w-4 h-4" />
        </motion.div>
      </div>
    </nav>
  );
}
