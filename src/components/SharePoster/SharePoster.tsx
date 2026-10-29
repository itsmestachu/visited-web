import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { drawPoster, loadPosterFonts, posterBlob, type PosterFormat, type PosterInput } from "../../services/poster/poster";
import { download } from "../../utils/download";
import { Button } from "../Button/Button";
import { ButtonRow, ErrorText } from "../ScreenLayout/ScreenLayout";
import { Segmented } from "../Segmented/Segmented";
import { Dialog, Head, Overlay, Preview, Title } from "./SharePoster.styles";

type Props = {
  input: PosterInput;
  onClose: () => void;
};

const FORMATS = [
  { value: "post" as const, label: "Post 1:1" },
  { value: "story" as const, label: "Story 9:16" },
];

const filename = (format: PosterFormat) => `mapa-podrozy-${format}.png`;

export function SharePoster({ input, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<PosterFormat>("post");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadPosterFonts()
      .catch(() => undefined)
      .then(() => {
        const canvas = canvasRef.current;
        if (!alive || !canvas) return;
        drawPoster(canvas, format, input);
        return posterBlob(canvas);
      })
      .then((blob) => {
        // Prepared up front: navigator.share must run straight from the click, without awaiting encoding.
        if (alive && blob) setFile(new File([blob], filename(format), { type: "image/png" }));
      })
      .catch(() => alive && setError("Nie udało się przygotować grafiki."));
    return () => {
      alive = false;
    };
  }, [format, input]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canShare = file !== null && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

  const share = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: "Moja mapa podróży" });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Udostępnianie się nie powiodło. Pobierz grafikę i wrzuć ją ręcznie.");
    }
  };

  return createPortal(
    <Overlay role="dialog" aria-modal="true" aria-label="Grafika do social mediów" onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Head>
          <Title>Pochwal się mapą</Title>
          <Button variant="icon" onClick={onClose} aria-label="Zamknij">
            ✕
          </Button>
        </Head>
        <Segmented
          options={FORMATS}
          value={format}
          onChange={(next) => {
            setFile(null);
            setFormat(next);
          }}
        />
        <Preview>
          <canvas ref={canvasRef} />
        </Preview>
        <ButtonRow>
          {canShare && (
            <Button variant="primary" onClick={share}>
              Udostępnij
            </Button>
          )}
          <Button variant={canShare ? "outline" : "primary"} disabled={!file} onClick={() => file && download(file, file.name)}>
            Pobierz PNG
          </Button>
        </ButtonRow>
        {error && <ErrorText>{error}</ErrorText>}
      </Dialog>
    </Overlay>,
    document.body,
  );
}
