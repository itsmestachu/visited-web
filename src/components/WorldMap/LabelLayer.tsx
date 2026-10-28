import { memo } from "react";
import type { City } from "../../data/data.types";
import { CITY_FONT, COUNTRY_FONT } from "./WorldMap.layout";
import { CityDot, CityGroup, CityText, CountryText, ScreenScale } from "./WorldMap.styles";
import type { CityItem, CountryLabelItem, Side } from "./WorldMap.types";

type Props = {
  countryLabels: CountryLabelItem[];
  cityItems: CityItem[];
  onCityClick: (city: City) => void;
};

// Positions are in map units and stay fixed while panning, so memoized labels only re-render when they enter or leave the view.
const CountryLabel = memo(function CountryLabel({ text, ux, uy }: { text: string; ux: number; uy: number }) {
  return (
    <g transform={`translate(${ux} ${uy})`}>
      <ScreenScale>
        <CountryText fontSize={COUNTRY_FONT} textAnchor="middle" dominantBaseline="central">
          {text}
        </CountryText>
      </ScreenScale>
    </g>
  );
});

type CityLabelProps = { city: City; ux: number; uy: number; side: Side; onClick: (city: City) => void };

const CityLabel = memo(function CityLabel({ city, ux, uy, side, onClick }: CityLabelProps) {
  return (
    <g transform={`translate(${ux} ${uy})`}>
      <ScreenScale>
        <CityGroup
          onClick={(e) => {
            e.stopPropagation();
            onClick(city);
          }}
        >
          <title>{`${city.namePl} — kliknij, aby zaznaczyć`}</title>
          <circle className="hit" r={10} />
          <CityDot r={3.4} />
          <CityText
            x={side === "right" ? 7 : -7}
            fontSize={CITY_FONT}
            textAnchor={side === "right" ? "start" : "end"}
            dominantBaseline="central"
          >
            {city.namePl}
          </CityText>
        </CityGroup>
      </ScreenScale>
    </g>
  );
});

export function LabelLayer({ countryLabels, cityItems, onCityClick }: Props) {
  return (
    <>
      <g>
        {countryLabels.map((l) => (
          <CountryLabel key={l.code} text={l.text} ux={l.ux} uy={l.uy} />
        ))}
      </g>
      <g>
        {cityItems.map(({ city, ux, uy, side }) => (
          <CityLabel key={city.id} city={city} ux={ux} uy={uy} side={side} onClick={onCityClick} />
        ))}
      </g>
    </>
  );
}
