import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import type { CityIndex } from "../../data/cities";
import { searchCities } from "../../data/cities";
import { searchCountries } from "../../data/countries";
import type { AppData, Status } from "../../store/store.types";
import type { SearchResult } from "./SearchBar.types";

const useSearchResults = (query: string, cities: CityIndex | null) =>
  useMemo<SearchResult[]>(() => {
    const countries = searchCountries(query, 4).map((country) => ({ kind: "country" as const, country }));
    const found = cities ? searchCities(cities, query, 8).map((city) => ({ kind: "city" as const, city })) : [];
    return [...countries, ...found];
  }, [query, cities]);

export const useCityStatuses = (data: AppData) =>
  useMemo(() => {
    const m = new Map<number, Status>();
    for (const p of Object.values(data.places)) if (p.cityId !== undefined) m.set(p.cityId, p.status);
    return m;
  }, [data.places]);

export const useSearch = (cities: CityIndex | null, onPick: (r: SearchResult) => void) => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const results = useSearchResults(query, cities);

  const pick = (r: SearchResult) => {
    onPick(r);
    setQuery("");
    setActive(0);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setActive(0);
    setOpen(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  return { query, results, changeQuery, active, setActive, open, setOpen, pick, onKeyDown };
};
