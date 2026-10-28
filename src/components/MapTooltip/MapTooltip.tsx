import type { Hover } from "../WorldMap/WorldMap.types";
import { Badge, Tip } from "./MapTooltip.styles";

export function MapTooltip({ hover }: { hover: Hover }) {
  return (
    <Tip style={{ left: hover.x, top: hover.y }}>
      {hover.label}
      {hover.badge && <Badge>{hover.badge}</Badge>}
    </Tip>
  );
}
