import { useTheme } from "styled-components";
import { countryName } from "../../data/countries";
import { ProgressBar } from "../../components/ProgressBar/ProgressBar";
import { Muted, ScreenLayout, Section } from "../../components/ScreenLayout/ScreenLayout";
import { useTravelStats } from "./StatsScreen.hooks";
import { StatTile } from "./StatTile";
import { BarRow } from "./BarRow";
import { BackupSection } from "./BackupSection";
import { Chip, Chips, Tiles } from "./StatsScreen.styles";
import type { StatsScreenProps } from "./StatsScreen.types";

export function StatsScreen({ data, backup, onOpenCountry }: StatsScreenProps) {
  const s = useTravelStats(data);
  const { colors } = useTheme();

  return (
    <ScreenLayout>
      <Tiles>
        <StatTile big value={s.visited} label={`krajów z ${s.total} · ${s.percent}% świata`}>
          <ProgressBar value={s.percent} color={colors.ink} />
        </StatTile>
        <StatTile value={s.continentsVisited} label="kontynentów" />
        <StatTile value={s.cities} label="miast" />
        <StatTile value={s.photos} label="zdjęć" />
      </Tiles>

      <Section title="Kontynenty">
        {s.continents.map((c) => (
          <BarRow key={c.code} label={c.name} value={c.done} max={c.total} caption={`${c.done}/${c.total}`} />
        ))}
      </Section>

      <Section title="Podróże w latach">
        {s.yearRows.length === 0 ? (
          <Muted>Dodaj daty do krajów lub miast, a pojawi się tu oś czasu.</Muted>
        ) : (
          s.yearRows.map((r) => (
            <BarRow
              key={r.year}
              label={String(r.year)}
              value={r.countries}
              max={s.maxYearCountries}
              caption={`${r.countries} kr. · ${r.places} m.`}
            />
          ))
        )}
      </Section>

      <Section title="Lista marzeń" count={s.wish.length}>
        {s.wish.length === 0 ? (
          <Muted>Przełącz mapę na „Chcę pojechać” i klikaj kraje.</Muted>
        ) : (
          <Chips>
            {s.wish.map((code) => (
              <Chip key={code} type="button" onClick={() => onOpenCountry(code)}>
                {countryName(code)}
              </Chip>
            ))}
          </Chips>
        )}
      </Section>

      <BackupSection {...backup} />
    </ScreenLayout>
  );
}
