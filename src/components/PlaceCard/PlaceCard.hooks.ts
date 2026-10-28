import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import type { Size } from "../WorldMap/WorldMap.types";

export const CARD_WIDTH = 268;
const GAP = 22;
const MARGIN = 8;
const PIN_HEAD = 14;

export const useCardPosition = (cardRef: RefObject<HTMLDivElement | null>, x: number, y: number, area: Size) => {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0]?.blockSize ?? el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [cardRef]);

  const left = x + GAP + CARD_WIDTH <= area.width - MARGIN ? x + GAP : Math.max(MARGIN, x - GAP - CARD_WIDTH);
  const top = Math.min(Math.max(MARGIN, y - PIN_HEAD - height / 2), Math.max(MARGIN, area.height - height - MARGIN));
  return { left, top };
};

export const useEscapeKey = (onEscape: () => void) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape]);
};
