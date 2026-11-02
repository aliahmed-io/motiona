export const chapters = [
  { id: "hero", name: "The beginning", image: "reveal", side: "left", title: ["Born from", "the sea."], detail: "The art of the open water", body: "Mahogany. Salt air. The first light of day. Some things are made to be felt.", note: "A Mediterranean reverie" },
  { id: "exterior", name: "The craft", image: "craft", side: "right", title: ["A feeling,", "handcrafted."], detail: "Every curve has a purpose", body: "Light follows the grain. Water traces the hull. Polished wood and chrome, shaped into one unbroken line.", note: "Mahogany / Chrome / Open water" },
  { id: "power", name: "The escape", image: "motion", side: "left", title: ["Leave it", "all behind."], detail: "Follow the wake", body: "The shore grows quiet. The horizon opens. Nothing ahead but the freedom to keep going.", note: "Made for the long way home" },
  { id: "interior", name: "The quiet", image: "cockpit", side: "right", title: ["Nowhere else", "to be."], detail: "A little closer to the sea", body: "Supple leather, warm timber, and a place in the sun. The smallest details make room for the biggest moments.", note: "An invitation to slow down" },
  { id: "contact", name: "The horizon", image: "horizon", side: "left", title: ["The sea", "is calling."], detail: "Every ending is a beginning", body: "Stay a little longer. Take the coast less travelled. Make the horizon your own.", note: "Your next chapter awaits" },
] as const;

export function goToChapter(index: number) {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: (index / (chapters.length - 1)) * range, behavior: reduced ? "instant" : "smooth" });
}
