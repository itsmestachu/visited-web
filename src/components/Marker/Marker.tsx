import type { Status } from "../../store/store.types";
import { Dot, Pin } from "./Marker.styles";

export function ColorDot({ status, color }: { status: Status; color?: string }) {
  return <Dot $status={status} style={status === "visited" && color ? { background: color } : undefined} />;
}

export function PinMarker({ status }: { status: Status }) {
  return <Pin $status={status} aria-hidden="true" />;
}
