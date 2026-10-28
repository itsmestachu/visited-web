import type { AppData } from "../../types/models";
import { countryName } from "../../data/countries";
import { useTravelStats } from "../../hooks/useTravelStats";
import { ProgressBar } from "../../ui/ProgressBar";
import { StatTile } from "./StatTile";
import { BarRow } from "./BarRow";
import "./StatsScreen.css";

type Props = {
  data: AppData;
  onOpenCountry: (code: string) => void;
};

export function StatsScreen({ data, onOpenCountry }: Props) {
  const s = useTravelStats(data);

  return (
    <div className="screen">
      <div className="stat-tiles">
        <StatTile big value={s.visited} label={`krajów z ${s.total} · ${s.percent}%`}>
          <ProgressBar value={s.percent} />
        </StatTile>
        <StatTile value={s.continentsVisited} label="kontynentów" />
        <StatTile value={s.cities} label="miast" />
        <StatTile value={s.photos} label="zdjęć" />
      </div>

      <section>
        <h3>Kontynenty</h3>
        {s.continents.map((c) => (
          <BarRow key={c.code} label={c.name} value={c.done} max={c.total} caption={`${c.done}/${c.total}`} />
        ))}
      </section>

      <section>
        <h3>Podróże w latach</h3>
        {s.yearRows.length === 0 ? (
          <p className="muted">Dodaj daty do krajów lub miast, a pojawi się tu oś czasu.</p>
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
      </section>

      <section>
        <h3>Lista marzeń ({s.wish.length})</h3>
        {s.wish.length === 0 ? (
          <p className="muted">Przełącz tryb na „Chcę odwiedzić” i klikaj kraje na mapie.</p>
        ) : (
          <div className="wish-chips">
            {s.wish.map((code) => (
              <button key={code} type="button" className="wish-chip" onClick={() => onOpenCountry(code)}>
                {countryName(code)}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
