import type { Hover } from "../../types/map";
import "./MapTooltip.css";

export function MapTooltip({ hover }: { hover: Hover }) {
  return (
    <div className="map-tooltip" style={{ left: hover.x, top: hover.y }}>
      {hover.label}
      {hover.badge && <span className="map-tooltip-badge">{hover.badge}</span>}
    </div>
  );
}
