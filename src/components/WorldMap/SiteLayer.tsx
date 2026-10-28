import { memo, useMemo } from "react";
import type { UnescoSite } from "../../data/data.types";
import { STATUS_LABEL } from "../../store/store.labels";
import type { SiteEntry } from "../../store/store.types";
import { projection } from "./WorldMap.projection";
import { ScreenScale, SiteMark } from "./WorldMap.styles";
import type { Hover } from "./WorldMap.types";

type Props = {
  sites: UnescoSite[];
  collected: Record<string, SiteEntry>;
  onClick: (site: UnescoSite) => void;
  onHover: (hover: Hover | null) => void;
};

const DIAMOND = "M0 -4.6L4.6 0L0 4.6L-4.6 0Z";

export const SiteLayer = memo(function SiteLayer({ sites, collected, onClick, onHover }: Props) {
  const points = useMemo(
    () =>
      sites.flatMap((site) => {
        const p = projection([site.lng, site.lat]);
        return p ? [{ site, x: p[0], y: p[1] }] : [];
      }),
    [sites],
  );

  return (
    <g>
      {points.map(({ site, x, y }) => {
        const status = collected[site.id]?.status;
        return (
          <g key={site.id} transform={`translate(${x} ${y})`}>
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
      })}
    </g>
  );
});
