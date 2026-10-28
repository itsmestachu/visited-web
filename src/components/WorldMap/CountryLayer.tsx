import { memo } from "react";
import type { CountryEntry } from "../../store/store.types";
import { countryName } from "../../data/countries";
import { STATUS_LABEL } from "../../store/store.labels";
import { countryGeometries } from "./WorldMap.projection";
import { CountryPath, InertPath } from "./WorldMap.styles";
import type { Hover } from "./WorldMap.types";

type Props = {
  countries: Record<string, CountryEntry>;
  onClick: (code: string) => void;
  onHover: (hover: Hover | null) => void;
};

export const CountryLayer = memo(function CountryLayer({ countries, onClick, onHover }: Props) {
  return (
    <>
      {countryGeometries.map((g) => {
        if (!g.code) return <InertPath key={g.key} d={g.d} />;
        const code = g.code;
        const entry = countries[code];
        return (
          <CountryPath
            key={g.key}
            d={g.d}
            $status={entry?.status ?? "none"}
            style={entry?.status === "visited" ? { fill: entry.color } : undefined}
            onClick={() => onClick(code)}
            onPointerMove={(e) =>
              onHover({
                label: countryName(code),
                badge: entry ? STATUS_LABEL[entry.status] : "kliknij, aby zaznaczyć",
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
