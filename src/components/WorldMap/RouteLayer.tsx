import { memo, useMemo } from "react";
import type { TripStop } from "../../store/store.types";
import { ROUTE_FONT, ROUTE_RADIUS } from "./WorldMap.layout";
import { path } from "./WorldMap.projection";
import { RouteLine, RouteMark, ScreenScale } from "./WorldMap.styles";
import type { RouteItem, RouteLabelSide } from "./WorldMap.types";

type Props = {
  stops: TripStop[];
  items: RouteItem[];
};

const LABEL_GAP = 6;

const labelPosition = (side: RouteLabelSide, half: number) => {
  if (side === "right") return { x: half + LABEL_GAP, y: 0, anchor: "start" as const };
  if (side === "left") return { x: -half - LABEL_GAP, y: 0, anchor: "end" as const };
  if (side === "top") return { x: 0, y: -ROUTE_RADIUS - LABEL_GAP - ROUTE_FONT / 2 - 3, anchor: "middle" as const };
  return { x: 0, y: ROUTE_RADIUS + LABEL_GAP + ROUTE_FONT / 2 + 3, anchor: "middle" as const };
};

const RouteMarker = memo(function RouteMarker({ item }: { item: RouteItem }) {
  const half = item.width / 2;
  const label = item.label ? labelPosition(item.side, half) : null;
  return (
    <g transform={`translate(${item.ux} ${item.uy})`}>
      <ScreenScale>
        <RouteMark>
          <title>{item.title}</title>
          <rect x={-half} y={-ROUTE_RADIUS} width={item.width} height={ROUTE_RADIUS * 2} rx={item.site ? 5 : ROUTE_RADIUS} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={12.5}>
            {item.text}
          </text>
          {label && (
            <text className="label" x={label.x} y={label.y} textAnchor={label.anchor} dominantBaseline="central" fontSize={ROUTE_FONT}>
              {item.label}
            </text>
          )}
        </RouteMark>
      </ScreenScale>
    </g>
  );
});

export const RouteLayer = memo(function RouteLayer({ stops, items }: Props) {
  const line = useMemo(
    () => (stops.length > 1 ? (path({ type: "LineString", coordinates: stops.map((s) => [s.lng, s.lat]) }) ?? "") : ""),
    [stops],
  );

  return (
    <g>
      {line && <RouteLine d={line} />}
      {items.map((item) => (
        <RouteMarker key={item.key} item={item} />
      ))}
    </g>
  );
});
