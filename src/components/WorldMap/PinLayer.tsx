import { CITY_FONT } from "./WorldMap.layout";
import { PinBadge, PinBody, PinDot, PinGroup, PinText, ScreenScale } from "./WorldMap.styles";
import type { PinItem } from "./WorldMap.types";

type Props = {
  pins: PinItem[];
  activePlaceId: string | null;
  onPinClick: (id: string) => void;
};

const PIN_PATH = "M0 0C-2-4-7.6-8-7.6-13.3a7.6 7.6 0 1 1 15.2 0C7.6-8 2-4 0 0Z";

export function PinLayer({ pins, activePlaceId, onPinClick }: Props) {
  return (
    <g>
      {pins.map(({ place, ux, uy, side }) => (
        <g key={place.id} transform={`translate(${ux} ${uy})`}>
          <ScreenScale>
            <PinGroup
              $status={place.status}
              $active={place.id === activePlaceId}
              onClick={(e) => {
                e.stopPropagation();
                onPinClick(place.id);
              }}
            >
              <PinBody d={PIN_PATH} />
              <PinDot cx={0} cy={-13.3} r={2.9} />
              {place.photos.length > 0 && (
                <PinBadge transform="translate(7 -21)">
                  <circle r={6.5} />
                  <text fontSize={8.5} textAnchor="middle" dominantBaseline="central">
                    {place.photos.length}
                  </text>
                </PinBadge>
              )}
              {side && (
                <PinText
                  x={side === "right" ? 12 : -12}
                  y={-12}
                  fontSize={CITY_FONT}
                  textAnchor={side === "right" ? "start" : "end"}
                  dominantBaseline="central"
                >
                  {place.name}
                </PinText>
              )}
            </PinGroup>
          </ScreenScale>
        </g>
      ))}
    </g>
  );
}
