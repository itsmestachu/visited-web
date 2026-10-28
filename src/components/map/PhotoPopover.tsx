import type { Place } from "../../types/models";
import { PhotoThumb } from "../photos/PhotoThumb";
import { countryName } from "../../data/countries";
import { formatDate } from "../../utils/dates";
import "./PhotoPopover.css";

const WIDTH = 252;
const MAX_THUMBS = 6;
const GAP = 26;

type Props = {
  place: Place;
  x: number;
  y: number;
  areaWidth: number;
  areaHeight: number;
  onOpen: (index: number, autoplay: boolean) => void;
  onClose: () => void;
};

export function PhotoPopover({ place, x, y, areaWidth, areaHeight, onOpen, onClose }: Props) {
  const shown = place.photos.slice(0, MAX_THUMBS);
  const rest = place.photos.length - shown.length;
  const height = 74 + Math.ceil(shown.length / 3) * 80;
  const left = x + GAP + WIDTH <= areaWidth - 8 ? x + GAP : Math.max(8, x - GAP - WIDTH);
  const top = Math.min(Math.max(8, y - height / 2 - 12), Math.max(8, areaHeight - height - 8));
  const subtitle = [countryName(place.countryCode), formatDate(place.date)].filter(Boolean).join(" · ");

  return (
    <div className="photo-popover" style={{ left, top, width: WIDTH }}>
      <div className="photo-popover-head">
        <div>
          <div className="photo-popover-title">{place.name}</div>
          <div className="photo-popover-sub">{subtitle}</div>
        </div>
        <button type="button" className="photo-popover-close" onClick={onClose} aria-label="Zamknij">
          ✕
        </button>
      </div>
      <div className="photo-popover-grid">
        {shown.map((id, i) => (
          <PhotoThumb
            key={id}
            id={id}
            onClick={() => onOpen(i, false)}
            overlay={i === shown.length - 1 && rest > 0 ? `+${rest}` : undefined}
          />
        ))}
      </div>
      {place.photos.length > 1 && (
        <button type="button" className="photo-popover-play" onClick={() => onOpen(0, true)}>
          ▶ Odtwórz wspomnienia
        </button>
      )}
    </div>
  );
}
