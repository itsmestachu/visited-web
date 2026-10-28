import type { City } from "../../types/geo";
import type { CityItem, CountryLabelItem } from "../../hooks/useLabelLayout";
import { CITY_FONT, COUNTRY_FONT } from "../../hooks/useLabelLayout";

type Props = {
  countryLabels: CountryLabelItem[];
  cityItems: CityItem[];
  onCityClick: (city: City) => void;
};

export function LabelLayer({ countryLabels, cityItems, onCityClick }: Props) {
  return (
    <>
      <g className="country-labels">
        {countryLabels.map((l) => (
          <text key={l.code} x={l.x} y={l.y} fontSize={COUNTRY_FONT} textAnchor="middle" dominantBaseline="central">
            {l.text}
          </text>
        ))}
      </g>
      <g className="city-layer">
        {cityItems.map(({ city, x, y, side }) => (
          <g
            key={city.id}
            className="city"
            transform={`translate(${x} ${y})`}
            onClick={(e) => {
              e.stopPropagation();
              onCityClick(city);
            }}
          >
            <circle className="city-hit" r={9} />
            <circle className="city-dot" r={3.2} />
            <text
              x={side === "right" ? 6 : -6}
              fontSize={CITY_FONT}
              textAnchor={side === "right" ? "start" : "end"}
              dominantBaseline="central"
            >
              {city.namePl}
            </text>
          </g>
        ))}
      </g>
    </>
  );
}
