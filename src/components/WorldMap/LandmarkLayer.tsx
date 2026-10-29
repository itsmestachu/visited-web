import { memo } from "react";
import type { Landmark } from "../../data/data.types";
import { LANDMARK_LABEL } from "../../data/landmarks";
import { LANDMARK_ICON_SIZE, LANDMARK_ICONS } from "../../data/landmarks.icons";
import { STATUS_LABEL } from "../../store/store.labels";
import type { SiteEntry, Status } from "../../store/store.types";
import { LANDMARK_FONT, LANDMARK_RADIUS } from "./WorldMap.layout";
import { LandmarkMark, ScreenScale } from "./WorldMap.styles";
import type { Hover, LandmarkItem } from "./WorldMap.types";

type Props = {
  items: LandmarkItem[];
  collected: Record<string, SiteEntry>;
  onClick: (landmark: Landmark) => void;
  onHover: (hover: Hover | null) => void;
};

const ICON = 14;

type MarkerProps = {
  item: LandmarkItem;
  status: Status | undefined;
  onClick: (landmark: Landmark) => void;
  onHover: (hover: Hover | null) => void;
};

const LandmarkMarker = memo(function LandmarkMarker({ item, status, onClick, onHover }: MarkerProps) {
  const { landmark, ux, uy, label, side } = item;
  return (
    <g transform={`translate(${ux} ${uy})`}>
      <ScreenScale>
        <LandmarkMark
          $status={status ?? "none"}
          onClick={(e) => {
            e.stopPropagation();
            onClick(landmark);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            onHover({
              label: landmark.name,
              badge: `${LANDMARK_LABEL[landmark.category]} · ${status ? STATUS_LABEL[status] : "kliknij, aby zaznaczyć"}`,
              x: e.clientX,
              y: e.clientY,
            });
          }}
        >
          <circle r={LANDMARK_RADIUS} />
          <path
            className="icon"
            d={LANDMARK_ICONS[landmark.category]}
            transform={`translate(${-ICON / 2} ${-ICON / 2}) scale(${ICON / LANDMARK_ICON_SIZE})`}
          />
          {side && (
            <text
              x={side === "right" ? LANDMARK_RADIUS + 4 : side === "left" ? -LANDMARK_RADIUS - 4 : 0}
              y={side === "top" ? -LANDMARK_RADIUS - 10 : side === "bottom" ? LANDMARK_RADIUS + 10 : 0}
              fontSize={LANDMARK_FONT}
              textAnchor={side === "right" ? "start" : side === "left" ? "end" : "middle"}
              dominantBaseline="central"
            >
              {label}
            </text>
          )}
        </LandmarkMark>
      </ScreenScale>
    </g>
  );
});

export function LandmarkLayer({ items, collected, onClick, onHover }: Props) {
  return (
    <g>
      {items.map((item) => (
        <LandmarkMarker
          key={item.landmark.id}
          item={item}
          status={collected[item.landmark.id]?.status}
          onClick={onClick}
          onHover={onHover}
        />
      ))}
    </g>
  );
}
