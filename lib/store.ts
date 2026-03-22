// Simple state management for React using a plain object.
// This works well with GSAP as we can mutate these values and use them in useFrame.

export const scrollState = {
  progress: 0,
  activeSection: 0,
};

// We will use this object as a shared reference.
// In a real production app, we'd use Zustland or Valtio, 
// but for a single-purpose animation, a shared object with GSAP is fine.
