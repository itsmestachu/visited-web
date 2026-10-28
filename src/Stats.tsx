import { useMemo } from "react";
import type { AppData } from "./store";
import { countries, countryByCode, countryName, CONTINENT_NAMES, type ContinentCode } from "./countries";
import { regionCount } from "./regions";
import { yearOf } from "./dates";

const CONTINENT_ORDER: ContinentCode[] = ["EU", "AS", "AF", "NA", "SA", "OC", "AN"];

export function Stats({ data, onOpenCountry }: { data: AppData; onOpenCountry: (code: string) => void }) {
  const s = useMemo(() => {
    const entries = Object.entries(data.countries);
    const visited = entries.filter(([, e]) => e.status === "visited").map(([c]) => c);
    const wish = entries.filter(([, e]) => e.status === "wish").map(([c]) => c);
    const places = Object.values(data.places);
    const visitedPlaces = places.filter((p) => p.status === "visited");
    const photos = places.reduce((n, p) => n + p.photos.length, 0);

    const continents = CONTINENT_ORDER.map((code) => {
      const all = countries.filter((c) => c.continent === code);
      const done = all.filter((c) => data.countries[c.code]?.status === "visited");
      return { code, name: CONTINENT_NAMES[code], done: done.length, total: all.length };
    }).filter((c) => c.total > 0);

    const years = new Map<number, { countries: Set<string>; places: number }>();
    const bucket = (y: number) => {
      let b = years.get(y);
      if (!b) {
        b = { countries: new Set(), places: 0 };
        years.set(y, b);
      }
      return b;
    };
    for (const [code, e] of entries) {
      const y = e.status === "visited" ? yearOf(e.date) : null;
      if (y) bucket(y).countries.add(code);
    }
    for (const p of visitedPlaces) {
      const y = yearOf(p.date);
      if (y) {
        const b = bucket(y);
        b.places++;
        b.countries.add(p.countryCode);
      }
    }
    const yearRows = [...years.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, b]) => ({ year, countries: b.countries.size, places: b.places }));
    const maxYear = Math.max(1, ...yearRows.map((r) => r.countries));

    const regionRows = visited
      .filter((code) => (data.countries[code].regions?.length ?? 0) > 0 && regionCount[code])
      .map((code) => ({
        code,
        name: countryName(code),
        done: data.countries[code].regions?.length ?? 0,
        total: regionCount[code],
        color: data.countries[code].color,
      }))
      .sort((a, b) => b.done / b.total - a.done / a.total);
    const regionsTotal = regionRows.reduce((n, r) => n + r.done, 0);

    return {
      visited: visited.length,
      wish: wish.length,
      percent: Math.round((visited.length / countries.length) * 1000) / 10,
      cities: visitedPlaces.length,
      photos,
      continents,
      continentsVisited: continents.filter((c) => c.done > 0).length,
      yearRows,
      maxYear,
      regionRows,
      regionsTotal,
    };
  }, [data]);

  return (
    <div className="stats-view">
      <div className="tiles">
        <div className="tile big">
          <span className="tile-value">{s.visited}</span>
          <span className="tile-label">
            krajów z {countries.length} · {s.percent}%
          </span>
          <div className="progress">
            <div style={{ width: `${s.percent}%` }} />
          </div>
        </div>
        <div className="tile">
          <span className="tile-value">{s.continentsVisited}</span>
          <span className="tile-label">kontynentów</span>
        </div>
        <div className="tile">
          <span className="tile-value">{s.cities}</span>
          <span className="tile-label">miast</span>
        </div>
        <div className="tile">
          <span className="tile-value">{s.regionsTotal}</span>
          <span className="tile-label">regionów</span>
        </div>
        <div className="tile">
          <span className="tile-value">{s.photos}</span>
          <span className="tile-label">zdjęć</span>
        </div>
        <div className="tile">
          <span className="tile-value">{s.wish}</span>
          <span className="tile-label">na liście marzeń</span>
        </div>
      </div>

      <section>
        <h3>Kontynenty</h3>
        {s.continents.map((c) => (
          <div key={c.code} className="bar-row">
            <span className="bar-label">{c.name}</span>
            <div className="bar">
              <div style={{ width: `${(c.done / c.total) * 100}%` }} />
            </div>
            <span className="bar-value">
              {c.done}/{c.total}
            </span>
          </div>
        ))}
      </section>

      <section>
        <h3>Podróże w latach</h3>
        {s.yearRows.length === 0 ? (
          <p className="muted">Dodaj daty do krajów lub miast, a pojawi się tu oś czasu.</p>
        ) : (
          s.yearRows.map((r) => (
            <div key={r.year} className="bar-row">
              <span className="bar-label">{r.year}</span>
              <div className="bar">
                <div style={{ width: `${(r.countries / s.maxYear) * 100}%` }} />
              </div>
              <span className="bar-value" title="kraje / miasta">
                {r.countries} kr. · {r.places} m.
              </span>
            </div>
          ))
        )}
      </section>

      <section>
        <h3>Regiony</h3>
        {s.regionRows.length === 0 ? (
          <p className="muted">Otwórz odwiedzony kraj i zaznacz regiony, np. województwa.</p>
        ) : (
          s.regionRows.map((r) => (
            <button key={r.code} type="button" className="bar-row clickable" onClick={() => onOpenCountry(r.code)}>
              <span className="bar-label">{r.name}</span>
              <div className="bar">
                <div style={{ width: `${(r.done / r.total) * 100}%`, background: r.color }} />
              </div>
              <span className="bar-value">
                {r.done}/{r.total}
              </span>
            </button>
          ))
        )}
      </section>

      {s.wish > 0 && (
        <section>
          <h3>Lista marzeń</h3>
          <div className="chips">
            {Object.entries(data.countries)
              .filter(([, e]) => e.status === "wish")
              .map(([code]) => code)
              .sort((a, b) => countryName(a).localeCompare(countryName(b), "pl"))
              .map((code) => (
                <button key={code} type="button" className="chip" onClick={() => onOpenCountry(code)}>
                  {countryByCode.get(code)?.name ?? code}
                </button>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
