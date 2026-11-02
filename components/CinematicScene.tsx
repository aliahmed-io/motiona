"use client";

/* Native images are kept decoded for frame-by-frame scroll compositing. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import { chapters } from "@/lib/voyage";
import { scrollState } from "@/lib/store";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export default function CinematicScene() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frames = Array.from(root.current!.querySelectorAll<HTMLElement>(".film-frame"));
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let compositor: Awaited<ReturnType<typeof import("@/lib/film-renderer").createFilmRenderer>> | undefined;
    let disposed = false;
    // Keep the photographic fallback visible until every texture is ready.
    import("@/lib/film-renderer")
      .then(({ createFilmRenderer }) => disposed ? undefined : createFilmRenderer(root.current!, chapters.map(chapter => `/images/voyage/${chapter.image}.webp`)))
      .then(result => {
        if (!result) return;
        if (disposed) { result.dispose(); return; }
        compositor = result;
        last = -1;
      })
      .catch(() => { /* The CSS reveal remains available without WebGL. */ });
    let request = 0;
    let last = -1;
    const render = () => {
      const progress = clamp(scrollState.progress);
      if (progress !== last) {
        const position = progress * (chapters.length - 1);
        const current = Math.min(Math.floor(position), chapters.length - 2);
        const local = position - current;
        const t = clamp((local - 0.18) / 0.64);
        const reveal = query.matches ? Number(t >= 0.5) : t * t * t * (t * (t * 6 - 15) + 10);
        frames.forEach((frame, index) => {
          const image = frame.querySelector("img")!;
          const ready = image.complete && image.naturalWidth > 0;
          frame.style.opacity = String(index === current || index === current + 1 && ready ? 1 : 0);
          frame.style.maskImage = index === current + 1
            ? query.matches ? (reveal ? "none" : "linear-gradient(transparent,transparent)")
              : `linear-gradient(90deg, transparent ${(1.24 - reveal * 1.48 - 0.18) * 100}%, black ${(1.24 - reveal * 1.48 + 0.18) * 100}%)`
            : "none";
          const travel = clamp((position - index + 1) / 2);
          frame.style.transform = query.matches ? "none" : `translate3d(${(travel - 0.5) * -2}%,0,0) scale(${1.04 + travel * 0.055})`;
        });
        root.current!.style.setProperty("--shade-right", String((current % 2 === 0 ? reveal : 1 - reveal)));
        compositor?.render(position, reveal, query.matches);
        last = progress;
      }
      request = requestAnimationFrame(render);
    };
    const invalidate = () => { last = -1; };
    const images = frames.map(frame => frame.querySelector("img")!);
    images.forEach(image => image.addEventListener("load", invalidate));
    query.addEventListener("change", invalidate);
    window.addEventListener("resize", invalidate);
    render();
    return () => {
      cancelAnimationFrame(request);
      disposed = true;
      compositor?.dispose();
      images.forEach(image => image.removeEventListener("load", invalidate));
      query.removeEventListener("change", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  return (
    <div ref={root} className="cinematic-scene" aria-hidden="true">
      {chapters.map((chapter, index) => (
        <div className={`film-frame film-frame-${index}`} key={chapter.id} style={{ opacity: index === 0 ? 1 : 0 }}>
          <img src={`/images/voyage/${chapter.image}.webp`} alt="" fetchPriority={index === 0 ? "high" : "low"} decoding="async" />
        </div>
      ))}
      <div className="film-shade film-shade-left" />
      <div className="film-shade film-shade-right" />
      <div className="film-vignette" />
    </div>
  );
}
