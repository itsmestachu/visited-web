import { useEffect, useMemo, useState } from "react";
import { searchCountries, countryName, type Country } from "./countries";
import { loadCities, searchCities, citiesReady, type City } from "./cities";
import type { AppData, Status } from "./store";

type Result = { kind: "country"; country: Country } | { kind: "city"; city: City };

type Props = {
  data: AppData;
  mode: Status;
  onPickCountry: (country: Country) => void;
  onPickCity: (city: City) => void;
};

const STATUS_TAG: Record<Status, string> = { visited: "✓ odwiedzony", wish: "★ na liście" };

export function Search({ data, mode, onPickCountry, onPickCity }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(citiesReady);

  useEffect(() => {
    if (open && !ready) loadCities().then(() => setReady(true));
  }, [open, ready]);

  const placeStatusByCity = useMemo(() => {
    const m = new Map<number, Status>();
    for (const p of Object.values(data.places)) if (p.cityId !== undefined) m.set(p.cityId, p.status);
    return m;
  }, [data.places]);

  const results = useMemo<Result[]>(() => {
    const c = searchCountries(query, 4).map((country) => ({ kind: "country" as const, country }));
    const cities = ready ? searchCities(query, 8).map((city) => ({ kind: "city" as const, city })) : [];
    return [...c, ...cities];
  }, [query, ready]);

  const pick = (r: Result) => {
    if (r.kind === "country") onPickCountry(r.country);
    else onPickCity(r.city);
    setQuery("");
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  const placeholder = mode === "visited" ? "Dodaj kraj lub miasto…" : "Dodaj do listy marzeń…";

  return (
    <div className="search">
      <input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="search-results"
        autoComplete="off"
      />
      {open && query.trim() !== "" && (
        <ul id="search-results" className="search-results" role="listbox">
          {results.length === 0 && <li className="search-empty">{ready ? "Brak wyników" : "Wczytywanie miast…"}</li>}
          {results.map((r, i) => {
            const status =
              r.kind === "country" ? data.countries[r.country.code]?.status : placeStatusByCity.get(r.city.id);
            const key = r.kind === "country" ? `c-${r.country.code}` : `m-${r.city.id}`;
            return (
              <li
                key={key}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : undefined}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(r);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span className="result-icon" aria-hidden="true">
                  {r.kind === "country" ? "◼" : "●"}
                </span>
                <span className="result-main">
                  <span className="result-name">{r.kind === "country" ? r.country.name : r.city.namePl}</span>
                  <span className="result-sub">
                    {r.kind === "country"
                      ? "Kraj"
                      : `${r.city.namePl !== r.city.name ? `${r.city.name} · ` : ""}${countryName(r.city.countryCode)}`}
                  </span>
                </span>
                {status && <span className={`search-tag ${status}`}>{STATUS_TAG[status]}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
