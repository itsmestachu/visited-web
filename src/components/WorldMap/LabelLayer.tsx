import type { City } from "../../data/data.types";
import { CITY_FONT, COUNTRY_FONT } from "./WorldMap.layout";
import { CityDot, CityGroup, CityText, CountryText, ScreenScale } from "./WorldMap.styles";
import type { CityItem, CountryLabelItem } from "./WorldMap.types";

type Props = {
  countryLabels: CountryLabelItem[];
  cityItems: CityItem[];
  onCityClick: (city: City) => void;
};

export function LabelLayer({ countryLabels, cityItems, onCityClick }: Props) {
  return (
    <>
      <g>
        {countryLabels.map((l) => (
          <g key={l.code} transform={`translate(${l.ux} ${l.uy})`}>
            <ScreenScale>
              <CountryText fontSize={COUNTRY_FONT} textAnchor="middle" dominantBaseline="central">
                {l.text}
              </CountryText>
            </ScreenScale>
          </g>
        ))}
      </g>
      <g>
        {cityItems.map(({ city, ux, uy, side }) => (
          <g key={city.id} transform={`translate(${ux} ${uy})`}>
            <ScreenScale>
              <CityGroup
                onClick={(e) => {
                  e.stopPropagation();
                  onCityClick(city);
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
        ))}
      </g>
    </>
  );
}
