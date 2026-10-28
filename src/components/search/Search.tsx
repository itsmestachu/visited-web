import { useMemo, useState } from "react";
import type { CityIndex } from "../../data/cities";
import type { City, Country } from "../../types/geo";
import type { AppData, Status } from "../../types/models";
import { useSearchResults, type SearchResult } from "./useSearchResults";
import { SearchResultRow } from "./SearchResultRow";
import "./Search.css";

type Props = {
  data: AppData;
  cities: CityIndex | null;
  mode: Status;
  onPickCountry: (country: Country) => void;
  onPickCity: (city: City) => void;
};

export function Search({ data, cities, mode, onPickCountry, onPickCity }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const results = useSearchResults(query, cities);

  const cityStatus = useMemo(() => {
    const m = new Map<number, Status>();
    for (const p of Object.values(data.places)) if (p.cityId !== undefined) m.set(p.cityId, p.status);
    return m;
  }, [data.places]);

  const pick = (r: SearchResult) => {
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

  return (
    <div className="search">
      <input
        type="search"
        placeholder={mode === "visited" ? "Szukaj kraju lub miasta…" : "Dodaj do listy marzeń…"}
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
          {results.length === 0 && <li className="search-empty">{cities ? "Brak wyników" : "Wczytywanie miast…"}</li>}
          {results.map((r, i) => (
            <SearchResultRow
              key={r.kind === "country" ? `c-${r.country.code}` : `m-${r.city.id}`}
              result={r}
              status={r.kind === "country" ? data.countries[r.country.code]?.status : cityStatus.get(r.city.id)}
              active={i === active}
              onPick={() => pick(r)}
              onHover={() => setActive(i)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
