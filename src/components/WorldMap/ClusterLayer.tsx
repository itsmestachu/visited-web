import { memo } from "react";
import { ClusterTile, ScreenScale } from "./WorldMap.styles";
import type { ClusterItem } from "./WorldMap.types";

type Props = {
  clusters: ClusterItem[];
  onClick: (points: [number, number][]) => void;
};

const H = 24;

// Several marked places that would overlap: a small stack of cards with their count; clicking zooms in to split it.
const Cluster = memo(function Cluster({ cluster, onClick }: { cluster: ClusterItem; onClick: (points: [number, number][]) => void }) {
  const half = cluster.width / 2;
  return (
    <g transform={`translate(${cluster.ux} ${cluster.uy})`}>
      <ScreenScale>
        <ClusterTile
          onClick={(e) => {
            e.stopPropagation();
            onClick(cluster.points);
          }}
        >
          <title>{`${cluster.title}\n\nKliknij, aby przybliżyć`}</title>
          <rect className="back" x={-half + 4} y={-H / 2 - 4} width={cluster.width} height={H} rx={5} />
          <rect className="front" x={-half} y={-H / 2} width={cluster.width} height={H} rx={5} />
          <text className="count" textAnchor="middle" dominantBaseline="central" fontSize={13}>
            {cluster.text}
          </text>
          {cluster.label && (
            <text
              className="label"
              x={cluster.side === "right" ? half + 6 : -half - 6}
              textAnchor={cluster.side === "right" ? "start" : "end"}
              dominantBaseline="central"
              fontSize={13}
            >
              {cluster.label}
            </text>
          )}
        </ClusterTile>
      </ScreenScale>
    </g>
  );
});

export function ClusterLayer({ clusters, onClick }: Props) {
  return (
    <g>
      {clusters.map((c) => (
        <Cluster key={c.key} cluster={c} onClick={onClick} />
      ))}
    </g>
  );
}
