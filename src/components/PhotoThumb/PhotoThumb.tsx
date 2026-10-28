import { usePhotoUrl } from "../../services/photoStorage/photoStorage.hooks";
import { Frame, Open, Overlay, Remove } from "./PhotoThumb.styles";
import type { PhotoThumbProps } from "./PhotoThumb.types";

export function PhotoThumb({ id, onOpen, onDelete, overlay }: PhotoThumbProps) {
  const url = usePhotoUrl(id, "thumb");
  return (
    <Frame>
      <Open type="button" onClick={onOpen} aria-label="Powiększ zdjęcie">
        {url && <img src={url} alt="" loading="lazy" />}
      </Open>
      {overlay && <Overlay>{overlay}</Overlay>}
      {onDelete && !overlay && (
        <Remove type="button" onClick={onDelete} aria-label="Usuń zdjęcie" title="Usuń zdjęcie">
          ✕
        </Remove>
      )}
    </Frame>
  );
}
