import { memo } from "react";
import type { CountryEntry } from "../../types/models";
import type { Hover } from "../../types/map";
import { countryName } from "../../data/countries";
import { STATUS_LABEL } from "../../constants/labels";
import { countryGeometries } from "./projection";

type Props = {
  countries: Record<string, CountryEntry>;
  onClick: (code: string) => void;
  onHover: (hover: Hover | null) => void;
};

export const CountryLayer = memo(function CountryLayer({ countries, onClick, onHover }: Props) {
  return (
    <>
      {countryGeometries.map((g) => {
        if (!g.code) return <path key={g.key} d={g.d} className="country inert" />;
        const code = g.code;
        const entry = countries[code];
        return (
          <path
            key={g.key}
            d={g.d}
            className={entry ? `country ${entry.status}` : "country"}
            style={entry?.status === "visited" ? { fill: entry.color } : undefined}
            onClick={() => onClick(code)}
            onPointerMove={(e) =>
              onHover({
                label: countryName(code),
                badge: entry ? STATUS_LABEL[entry.status] : undefined,
                x: e.clientX,
                y: e.clientY,
              })
            }
          />
        );
      })}
    </>
  );
});
