import { useMemo } from "react";
import type { CityIndex } from "../../data/cities";
import type { City, Country } from "../../types/geo";
import type { AppData, Place, Status } from "../../types/models";
import { countryName } from "../../data/countries";
import { formatDate } from "../../utils/dates";
import { comparePl } from "../../utils/text";
import { Search } from "../../components/search/Search";
import { List, ListRow } from "../../components/lists/ListRow";
import { ColorDot, PinMarker } from "../../components/lists/Markers";

type Props = {
  data: AppData;
  places: Place[];
  cities: CityIndex | null;
  mode: Status;
  onPickCountry: (country: Country) => void;
  onPickCity: (city: City) => void;
  onOpenCountry: (code: string) => void;
  onOpenPlace: (id: string) => void;
};

const HINT: Record<Status, string> = {
  visited: "Klikaj kraje i miasta na mapie, żeby oznaczyć je jako odwiedzone.",
  wish: "Klikaj kraje i miasta na mapie, żeby dodać je do listy marzeń.",
};

export function HomeScreen({ data, places, cities, mode, onPickCountry, onPickCity, onOpenCountry, onOpenPlace }: Props) {
  const countryRows = useMemo(
    () =>
      Object.entries(data.countries)
        .filter(([, e]) => e.status === mode)
        .map(([code, entry]) => ({ code, entry, name: countryName(code) }))
        .sort((a, b) => comparePl(a.name, b.name)),
    [data.countries, mode],
  );
  const placeRows = places.filter((p) => p.status === mode);

  return (
    <div className="screen">
      <p className="hint">{HINT[mode]}</p>
      <Search data={data} cities={cities} mode={mode} onPickCountry={onPickCountry} onPickCity={onPickCity} />

      <section>
        <h3>Kraje ({countryRows.length})</h3>
        {countryRows.length === 0 ? (
          <p className="muted">Nic tu jeszcze nie ma.</p>
        ) : (
          <List>
            {countryRows.map(({ code, entry, name }) => {
              const cityCount = places.filter((p) => p.countryCode === code).length;
              return (
                <ListRow
                  key={code}
                  marker={<ColorDot status={entry.status} color={entry.color} />}
                  title={name}
                  meta={[formatDate(entry.date), cityCount ? `${cityCount} m.` : ""].filter(Boolean).join(" · ")}
                  onClick={() => onOpenCountry(code)}
                />
              );
            })}
          </List>
        )}
      </section>

      {placeRows.length > 0 && (
        <section>
          <h3>Miasta ({placeRows.length})</h3>
          <List>
            {placeRows.map((p) => (
              <ListRow
                key={p.id}
                marker={<PinMarker status={p.status} />}
                title={p.name}
                subtitle={countryName(p.countryCode)}
                meta={[formatDate(p.date), p.photos.length ? `${p.photos.length} zdj.` : ""].filter(Boolean).join(" · ")}
                onClick={() => onOpenPlace(p.id)}
              />
            ))}
          </List>
        </section>
      )}
    </div>
  );
}
