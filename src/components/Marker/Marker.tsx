import type { Status } from "../../store/store.types";
import type { LandmarkCategory } from "../../data/data.types";
import { LANDMARK_ICON_SIZE, LANDMARK_ICONS } from "../../data/landmarks.icons";
import { DiamondMark, Dot, IconBadge, Pin } from "./Marker.styles";

export function ColorDot({ status, color }: { status: Status; color?: string }) {
  return <Dot $status={status} style={status === "visited" && color ? { background: color } : undefined} />;
}

export function LandmarkMarker({ status, category }: { status: Status; category: LandmarkCategory }) {
  return (
    <IconBadge $status={status} aria-hidden="true">
      <svg viewBox={`0 0 ${LANDMARK_ICON_SIZE} ${LANDMARK_ICON_SIZE}`}>
        <path d={LANDMARK_ICONS[category]} />
      </svg>
    </IconBadge>
  );
}

export function SiteMarker({ status }: { status: Status }) {
  return <DiamondMark $status={status} aria-hidden="true" />;
}

export function PinMarker({ status }: { status: Status }) {
  return <Pin $status={status} aria-hidden="true" />;
}
