import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePhotoUrl } from "./photos";

type Props = {
  title: string;
  subtitle?: string;
  photoIds: string[];
  startIndex: number;
  autoplay: boolean;
  onClose: () => void;
  onDelete: (photoId: string) => void;
};

const SLIDE_MS = 3500;

export function PhotoViewer({ title, subtitle, photoIds, startIndex, autoplay, onClose, onDelete }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(autoplay);
  const count = photoIds.length;
  const current = photoIds[Math.min(index, count - 1)];
  const url = usePhotoUrl(current ?? "", "full");

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (count === 0) onClose();
  }, [count, onClose]);

  useEffect(() => {
    if (!playing || count < 2) return;
    const t = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(t);
  }, [playing, index, count, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  if (!current) return null;

  return createPortal(
    <div className="viewer" role="dialog" aria-modal="true" aria-label={title}>
      <div className="viewer-top">
        <div>
          <div className="viewer-title">{title}</div>
          {subtitle && <div className="viewer-sub">{subtitle}</div>}
        </div>
        <div className="viewer-actions">
          <span className="viewer-count">
            {Math.min(index, count - 1) + 1} / {count}
          </span>
          {count > 1 && (
            <button type="button" onClick={() => setPlaying((p) => !p)}>
              {playing ? "❚❚ Pauza" : "▶ Pokaz"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm("Usunąć to zdjęcie?")) onDelete(current);
            }}
          >
            Usuń
          </button>
          <button type="button" onClick={onClose} aria-label="Zamknij">
            ✕
          </button>
        </div>
      </div>
      <div className="viewer-stage" onClick={onClose}>
        {url && <img key={current} src={url} alt="" className="viewer-img" onClick={(e) => e.stopPropagation()} />}
        {count > 1 && (
          <>
            <button
              type="button"
              className="viewer-nav prev"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Poprzednie"
            >
              ‹
            </button>
            <button
              type="button"
              className="viewer-nav next"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Następne"
            >
              ›
            </button>
          </>
        )}
      </div>
      {playing && count > 1 && <div key={`${current}-${index}`} className="viewer-progress" />}
    </div>,
    document.body,
  );
}
