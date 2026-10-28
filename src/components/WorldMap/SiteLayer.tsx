import { memo, useMemo } from "react";
import type { UnescoSite } from "../../data/data.types";
import { STATUS_LABEL } from "../../store/store.labels";
import type { SiteEntry, Status } from "../../store/store.types";
import { projection, visibleUnits } from "./WorldMap.projection";
import { ScreenScale, SiteMark } from "./WorldMap.styles";
import type { Hover, Viewport } from "./WorldMap.types";

type Props = {
  sites: UnescoSite[];
  collected: Record<string, SiteEntry>;
  viewport: Viewport;
  onClick: (site: UnescoSite) => void;
  onHover: (hover: Hover | null) => void;
};

const DIAMOND = "M0 -4.6L4.6 0L0 4.6L-4.6 0Z";
const EDGE = 40;

type MarkerProps = {
  site: UnescoSite;
  x: number;
  y: number;
  status: Status | undefined;
  onClick: (site: UnescoSite) => void;
  onHover: (hover: Hover | null) => void;
};

const SiteMarker = memo(function SiteMarker({ site, x, y, status, onClick, onHover }: MarkerProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ScreenScale>
        <SiteMark
          $status={status ?? "none"}
          onClick={(e) => {
            e.stopPropagation();
            onClick(site);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            onHover({
              label: site.name,
              badge: status ? `UNESCO · ${STATUS_LABEL[status]}` : "UNESCO · kliknij, aby zaznaczyć",
              x: e.clientX,
              y: e.clientY,
            });
          }}
        >
          <circle className="hit" r={9} />
          <path d={DIAMOND} />
        </SiteMark>
      </ScreenScale>
    </g>
  );
});

export function SiteLayer({ sites, collected, viewport, onClick, onHover }: Props) {
  const points = useMemo(
    () =>
      sites.flatMap((site) => {
        const p = projection([site.lng, site.lat]);
        return p ? [{ site, x: p[0], y: p[1] }] : [];
      }),
    [sites],
  );

  const [minX, minY, maxX, maxY] = visibleUnits(viewport, EDGE);

  return (
    <g>
      {points.map(({ site, x, y }) =>
        x >= minX && x <= maxX && y >= minY && y <= maxY ? (
          <SiteMarker key={site.id} site={site} x={x} y={y} status={collected[site.id]?.status} onClick={onClick} onHover={onHover} />
        ) : null,
      )}
    </g>
  );
}
