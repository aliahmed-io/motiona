"use client";

import { useEffect, useRef, useState } from "react";
import HorizontalScroll from "@/components/HorizontalScroll";
import { chapters, goToChapter } from "@/lib/voyage";
import { scrollState } from "@/lib/store";

function JourneyControls() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let previous = -1;
    const update = () => {
      const p = scrollState.progress;
      progress.current?.style.setProperty("--progress", `${p * 100}%`);
      const next = Math.round(p * 4);
      if (next !== previous) { setActive(next); previous = next; }
      frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const startPosition = window.scrollY / range;
    let start = 0;
    let frame = 0;
    const stop = () => setPlaying(false);
    const stopForInput = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".watch-journey")) return;
      stop();
    };
    const tick = (time: number) => {
      if (!start) start = time;
      const p = Math.min(1, startPosition + (time - start) / 32000);
      window.scrollTo({ top: p * range, behavior: "instant" });
      if (p >= 1) { setPlaying(false); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stopForInput);
    window.addEventListener("pointerdown", stopForInput);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stopForInput);
      window.removeEventListener("pointerdown", stopForInput);
    };
  }, [playing]);

  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (scrollState.progress > 0.98) window.scrollTo({ top: 0, behavior: "instant" });
    setPlaying(true);
  };

  return (
    <footer className="journey-footer" ref={progress}>
      <div className="journey-meta">
        <span className="journey-index">0{active + 1}<span> / 05</span></span>
        <span className="scroll-direction">Scroll to drift <span aria-hidden="true">⟶</span></span>
        <button className="watch-journey" onClick={togglePlay} aria-pressed={playing}>
          <span className={playing ? "pause-icon" : "play-icon"} aria-hidden="true" />
          {playing ? "Pause journey" : "Play the journey"}
        </button>
      </div>
      <nav className="chapter-navigation" aria-label="Journey chapters">
        {chapters.map((chapter, index) => (
          <button key={chapter.id} onClick={() => { setPlaying(false); goToChapter(index); }} aria-current={index === active ? "step" : undefined}>
            <span className="chapter-nav-number">0{index + 1}</span>
            <span>{chapter.name}</span>
          </button>
        ))}
      </nav>
      <div className="journey-progress" />
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <HorizontalScroll>
        {chapters.map((chapter, index) => (
          <section id={chapter.id} key={chapter.id} className={`horizontal-section story-section story-${chapter.side}`} aria-label={chapter.name}>
            <div className="chapter-content">
              <p className="story-detail">{chapter.detail}</p>
              {index === 0 ? (
                <h1>{chapter.title[0]}<br />{chapter.title[1]}</h1>
              ) : (
                <h2>{chapter.title[0]}<br />{chapter.title[1]}</h2>
              )}
              <p className="story-body">{chapter.body}</p>
              {index === 0 && <button className="story-link" onClick={() => goToChapter(1)}>Enter the story <span aria-hidden="true">⟶</span></button>}
              {index === 4 && <button className="story-link" onClick={() => goToChapter(0)}>Experience it again <span aria-hidden="true">↺</span></button>}
              {index > 0 && index < 4 && <span className="story-note">{chapter.note}</span>}
            </div>
            {index === 0 && <span className="chapter-caption">An ode to the Italian runabout</span>}
          </section>
        ))}
      </HorizontalScroll>
      <JourneyControls />
    </>
  );
}
