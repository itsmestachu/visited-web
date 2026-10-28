import type { Status } from "../../types/models";
import "./Markers.css";

export function ColorDot({ status, color }: { status: Status; color?: string }) {
  return <span className={`color-dot ${status}`} style={status === "visited" ? { background: color } : undefined} />;
}

export function PinMarker({ status }: { status: Status }) {
  return <span className={`pin-marker ${status}`} aria-hidden="true" />;
}
