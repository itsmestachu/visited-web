import { Wrapper, ZoomButton } from "./ZoomControls.styles";
import type { ZoomControlsProps } from "./ZoomControls.types";

export function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <Wrapper>
      <ZoomButton type="button" onClick={onZoomIn} aria-label="Przybliż" title="Przybliż">
        +
      </ZoomButton>
      <ZoomButton type="button" onClick={onZoomOut} aria-label="Oddal" title="Oddal">
        −
      </ZoomButton>
      <ZoomButton type="button" onClick={onReset} aria-label="Cała mapa" title="Pokaż cały świat">
        ⤢
      </ZoomButton>
    </Wrapper>
  );
}
