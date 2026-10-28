import { countryName } from "../../data/countries";
import { formatDate } from "../../utils/dates";
import { SearchBar } from "../../components/SearchBar/SearchBar";
import { List, ListRow } from "../../components/ListRow/ListRow";
import { ColorDot, PinMarker } from "../../components/Marker/Marker";
import { Muted, ScreenLayout, Section } from "../../components/ScreenLayout/ScreenLayout";
import { useHomeLists } from "./HomeScreen.hooks";
import type { HomeScreenProps } from "./HomeScreen.types";

const EMPTY = {
  visited: {
    countries: "Kliknij kraj na mapie albo wpisz go w wyszukiwarkę.",
    cities: "Kliknij kropkę miasta na mapie, żeby postawić pinezkę.",
  },
  wish: {
    countries: "Przełącz mapę na „Chcę pojechać” i klikaj kraje.",
    cities: "Miasta z listy marzeń pojawią się tutaj.",
  },
};

export function HomeScreen({
  data,
  places,
  cities,
  mode,
  onPickCountry,
  onPickCity,
  onOpenCountry,
  onOpenPlace,
  onRemoveCountry,
  onRemovePlace,
}: HomeScreenProps) {
  const { countryRows, placeRows } = useHomeLists(data, places, mode);

  return (
    <ScreenLayout>
      <SearchBar data={data} cities={cities} mode={mode} onPickCountry={onPickCountry} onPickCity={onPickCity} />

      <Section title="Miasta" count={placeRows.length}>
        {placeRows.length === 0 ? (
          <Muted>{EMPTY[mode].cities}</Muted>
        ) : (
          <List>
            {placeRows.map((p) => (
              <ListRow
                key={p.id}
                marker={<PinMarker status={p.status} />}
                title={p.name}
                subtitle={countryName(p.countryCode)}
                meta={[formatDate(p.date), p.photos.length ? `${p.photos.length} zdj.` : ""].filter(Boolean).join(" · ")}
                onClick={() => onOpenPlace(p.id)}
                onDelete={() => onRemovePlace(p.id)}
                deleteLabel={`Usuń ${p.name}`}
              />
            ))}
          </List>
        )}
      </Section>

      <Section title="Kraje" count={countryRows.length}>
        {countryRows.length === 0 ? (
          <Muted>{EMPTY[mode].countries}</Muted>
        ) : (
          <List>
            {countryRows.map(({ code, entry, name, cities: count }) => (
              <ListRow
                key={code}
                marker={<ColorDot status={entry.status} color={entry.color} />}
                title={name}
                meta={[formatDate(entry.date), count ? `${count} m.` : ""].filter(Boolean).join(" · ")}
                onClick={() => onOpenCountry(code)}
                onDelete={() => onRemoveCountry(code)}
                deleteLabel={`Odznacz ${name}`}
              />
            ))}
          </List>
        )}
      </Section>
    </ScreenLayout>
  );
}
