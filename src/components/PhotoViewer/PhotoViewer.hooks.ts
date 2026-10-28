import { useCallback, useEffect, useState } from "react";

const SLIDE_MS = 3500;

export const SLIDE_DURATION = SLIDE_MS;

export const useSlideshow = (count: number, startIndex: number, autoplay: boolean, onClose: () => void) => {
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(autoplay);
  const safeIndex = Math.min(index, Math.max(0, count - 1));

  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(1, count)), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % Math.max(1, count)), [count]);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  useEffect(() => {
    if (count === 0) onClose();
  }, [count, onClose]);

  useEffect(() => {
    if (!playing || count < 2) return;
    const t = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(t);
  }, [playing, safeIndex, count, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, togglePlay, onClose]);

  return { index: safeIndex, playing, next, prev, togglePlay };
};
