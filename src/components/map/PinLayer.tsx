import type { PinItem } from "../../hooks/useLabelLayout";
import { CITY_FONT } from "../../hooks/useLabelLayout";

type Props = {
  pins: PinItem[];
  activePlaceId: string | null;
  onPinClick: (id: string) => void;
};

const PIN_PATH = "M0 0C-1.9-3.8-7.2-7.6-7.2-12.6a7.2 7.2 0 1 1 14.4 0C7.2-7.6 1.9-3.8 0 0Z";

export function PinLayer({ pins, activePlaceId, onPinClick }: Props) {
  return (
    <g className="pin-layer">
      {pins.map(({ place, x, y, side }) => (
        <g
          key={place.id}
          className={`pin ${place.status}${place.id === activePlaceId ? " active" : ""}`}
          transform={`translate(${x} ${y})`}
          onClick={(e) => {
            e.stopPropagation();
            onPinClick(place.id);
          }}
        >
          <path className="pin-body" d={PIN_PATH} />
          <circle className="pin-dot" cx={0} cy={-12.6} r={2.8} />
          {place.photos.length > 0 && (
            <g className="pin-badge" transform="translate(6 -20)">
              <circle r={6} />
              <text fontSize={8} textAnchor="middle" dominantBaseline="central">
                {place.photos.length}
              </text>
            </g>
          )}
          {side && (
            <text
              className="pin-label"
              x={side === "right" ? 11 : -11}
              y={-12}
              fontSize={CITY_FONT}
              textAnchor={side === "right" ? "start" : "end"}
              dominantBaseline="central"
            >
              {place.name}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}
