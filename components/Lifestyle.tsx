"use client";

export default function Lifestyle() {
  return (
    <section className="horizontal-section h-screen w-[calc(100vw-5rem)] shrink-0 relative flex items-center p-24">
      <div className="absolute inset-0 -z-10">
        <img src="/yacht_interior.png" alt="Yacht Interior" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex justify-end">
        <div className="max-w-xl text-right">
          <h2 className="font-heading text-[4rem] leading-none mb-8 text-on-surface">
            A Floating <br /> Sanctuary
          </h2>
          <p className="text-on-surface-variant leading-relaxed mb-10 text-lg">
            Expansive layouts designed with the rarest woods, italian marble, and absolute silence. The open-plan salon blends seamlessly with the aft deck to create a singular, infinite space dedicated to your comfort.
          </p>
          <button className="text-primary uppercase tracking-[0.2em] text-sm border-b border-primary/30 pb-1 hover:border-primary transition-colors">
            View Gallery
          </button>
        </div>
      </div>
    </section>
  );
}
