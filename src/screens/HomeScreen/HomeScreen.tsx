import { countryName } from "../../data/countries";
import { formatDate } from "../../utils/dates";
import { SearchBar } from "../../components/SearchBar/SearchBar";
import { List, ListRow } from "../../components/ListRow/ListRow";
import { ColorDot, LandmarkMarker, PinMarker, SiteMarker } from "../../components/Marker/Marker";
import { LANDMARK_LABEL } from "../../data/landmarks";
import { comparePl } from "../../utils/text";
import { Muted, ScreenLayout, Section } from "../../components/ScreenLayout/ScreenLayout";
import { useHomeLists } from "./HomeScreen.hooks";
import type { CollectedRow, HomeScreenProps } from "./HomeScreen.types";

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
  landmarkRows,
  siteRows,
  onOpenCollected,
  onRemoveLandmark,
  onRemoveSite,
}: HomeScreenProps) {
  const { countryRows, placeRows } = useHomeLists(data, places, mode);
  const inMode = (rows: CollectedRow[]) => rows.filter((r) => r.status === mode).sort((a, b) => comparePl(a.name, b.name));
  const landmarks = inMode(landmarkRows);
  const sites = inMode(siteRows);

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

      {landmarks.length > 0 && (
        <Section title="Atrakcje" count={landmarks.length}>
          <List>
            {landmarks.map((r) => (
              <ListRow
                key={r.key}
                marker={r.category && <LandmarkMarker status={r.status} category={r.category} />}
                title={r.name}
                subtitle={[r.category ? LANDMARK_LABEL[r.category] : "", countryName(r.countryCodes[0])].filter(Boolean).join(" · ")}
                onClick={() => onOpenCollected(r)}
                onDelete={() => onRemoveLandmark(r)}
                deleteLabel={`Odznacz ${r.name}`}
              />
            ))}
          </List>
        </Section>
      )}

      {sites.length > 0 && (
        <Section title="UNESCO" count={sites.length}>
          <List>
            {sites.map((r) => (
              <ListRow
                key={r.key}
                marker={<SiteMarker status={r.status} />}
                title={r.name}
                subtitle={r.countryCodes.map(countryName).join(", ")}
                onClick={() => onOpenCollected(r)}
                onDelete={() => onRemoveSite(r)}
                deleteLabel={`Odznacz ${r.name}`}
              />
            ))}
          </List>
        </Section>
      )}

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
