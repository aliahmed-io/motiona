"use client";

import { goToChapter } from "@/lib/voyage";

export default function Navbar() {
  return (
    <header className="voyage-header">
      <button className="voyage-brand" onClick={() => goToChapter(0)} aria-label="Abyssal, return to the beginning">
        <svg width="29" height="34" viewBox="0 0 29 34" fill="none" aria-hidden="true">
          <path d="M14.5 1L28 25H1L14.5 1Z" stroke="currentColor" strokeWidth=".8" />
          <path d="M4 31C8 28 10 34 14.5 31C19 28 21 34 25 31M14.5 11V24M9 21H20" stroke="currentColor" strokeWidth=".8" />
        </svg>
        <span>Abyssal</span>
      </button>
      <span className="header-description">A life on the water</span>
      <button className="header-explore" onClick={() => goToChapter(4)}>Find your horizon <span aria-hidden="true">↗</span></button>
    </header>
  );
}
