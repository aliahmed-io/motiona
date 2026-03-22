"use client";

export default function Specs() {
  const specs = [
    { label: "Max Speed", value: "35 KNOTS" },
    { label: "Cruising Range", value: "4000 NM" },
    { label: "Overall Length", value: "82 METERS" },
    { label: "Beam", value: "12 METERS" },
  ];

  return (
    <section className="horizontal-section h-screen w-[calc(100vw-5rem)] shrink-0 relative flex items-center justify-center p-24">
      <div className="max-w-6xl w-full grid grid-cols-2 gap-24 items-center">
        <div>
          <h2 className="font-heading text-[4rem] leading-none mb-8 text-on-surface">
            Engineering <br /> Perfection
          </h2>
          <p className="text-on-surface-variant leading-relaxed max-w-md">
            Built for those who refuse to compromise. The Abyssal series represents the pinnacle of nautical engineering, combining lightweight composite materials with aerodynamics that redefine efficiency and speed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {specs.map((spec, idx) => (
            <div key={idx} className="glass p-10 rounded-xl hover:bg-surface-variant/50 transition-colors">
              <p className="text-on-surface-variant text-xs tracking-widest uppercase mb-4">
                {spec.label}
              </p>
              <p className="font-heading text-3xl text-primary">
                {spec.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
