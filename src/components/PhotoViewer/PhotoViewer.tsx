import { createPortal } from "react-dom";
import { usePhotoUrl } from "../../services/photoStorage/photoStorage.hooks";
import { SLIDE_DURATION, useSlideshow } from "./PhotoViewer.hooks";
import { Actions, Count, Image, Nav, Overlay, Progress, Stage, Subtitle, Title, Top, TopButton } from "./PhotoViewer.styles";
import { SKETCH_COVER, type PhotoViewerProps } from "./PhotoViewer.types";

export function PhotoViewer({ title, subtitle, photoIds, startIndex, autoplay, onClose, onDelete, cover }: PhotoViewerProps) {
  const count = photoIds.length;
  const { index, playing, next, prev, togglePlay } = useSlideshow(count, startIndex, autoplay, onClose);
  const current = photoIds[index];
  const url = usePhotoUrl(current ?? "", "full");

  if (!current) return null;

  return createPortal(
    <Overlay role="dialog" aria-modal="true" aria-label={title}>
      <Top>
        <div>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </div>
        <Actions>
          <Count>
            {index + 1} / {count}
          </Count>
          {count > 1 && <TopButton onClick={togglePlay}>{playing ? "❚❚ Pauza" : "▶ Pokaz"}</TopButton>}
          {cover && (
            <>
              <TopButton $active={cover.value === current} aria-pressed={cover.value === current} onClick={() => cover.onChange(current)}>
                {cover.value === current ? "✓ Miniaturka" : "Ustaw jako miniaturkę"}
              </TopButton>
              <TopButton
                $active={cover.value === SKETCH_COVER}
                aria-pressed={cover.value === SKETCH_COVER}
                onClick={() => cover.onChange(SKETCH_COVER)}
                title="Na karcie zamiast zdjęcia pokaż rysowaną mapkę"
              >
                {cover.value === SKETCH_COVER ? "✓ Rysunek" : "Użyj rysunku"}
              </TopButton>
            </>
          )}
          {onDelete && (
            <TopButton $danger onClick={() => onDelete(current)}>
              Usuń zdjęcie
            </TopButton>
          )}
          <TopButton onClick={onClose} aria-label="Zamknij">
            ✕
          </TopButton>
        </Actions>
      </Top>
      <Stage onClick={onClose}>
        {url && <Image key={current} src={url} alt="" onClick={(e) => e.stopPropagation()} />}
        {count > 1 && (
          <>
            <Nav
              $side="left"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Poprzednie"
            >
              ‹
            </Nav>
            <Nav
              $side="right"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Następne"
            >
              ›
            </Nav>
          </>
        )}
      </Stage>
      {playing && count > 1 && <Progress key={`${current}-${index}`} $duration={SLIDE_DURATION} />}
    </Overlay>,
    document.body,
  );
}
