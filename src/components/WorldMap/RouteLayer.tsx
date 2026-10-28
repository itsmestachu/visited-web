import { memo, useMemo } from "react";
import type { TripStop } from "../../store/store.types";
import { path, projection } from "./WorldMap.projection";
import { RouteLine, RouteMark, ScreenScale } from "./WorldMap.styles";

type Props = {
  stops: TripStop[];
};

export const RouteLayer = memo(function RouteLayer({ stops }: Props) {
  const line = useMemo(
    () => (stops.length > 1 ? (path({ type: "LineString", coordinates: stops.map((s) => [s.lng, s.lat]) }) ?? "") : ""),
    [stops],
  );
  const points = useMemo(
    () =>
      stops.flatMap((stop, i) => {
        const p = projection([stop.lng, stop.lat]);
        return p ? [{ stop, n: i + 1, x: p[0], y: p[1] }] : [];
      }),
    [stops],
  );

  return (
    <g pointerEvents="none">
      {line && <RouteLine d={line} />}
      {points.map(({ stop, n, x, y }) => (
        <g key={stop.id} transform={`translate(${x} ${y})`}>
          <ScreenScale>
            <RouteMark>
              {stop.siteId ? <rect x={-10} y={-10} width={20} height={20} rx={4} /> : <circle r={10.5} />}
              <text textAnchor="middle" dominantBaseline="central" fontSize={11}>
                {n}
              </text>
              <text className="label" x={15} dominantBaseline="central" fontSize={12}>
                {stop.name}
              </text>
            </RouteMark>
          </ScreenScale>
        </g>
      ))}
    </g>
  );
});
