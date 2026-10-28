import { useMemo } from "react";
import type { CityIndex } from "../../data/cities";
import { searchCities } from "../../data/cities";
import { searchCountries } from "../../data/countries";
import type { City, Country } from "../../types/geo";

export type SearchResult = { kind: "country"; country: Country } | { kind: "city"; city: City };

export const useSearchResults = (query: string, cities: CityIndex | null) =>
  useMemo<SearchResult[]>(() => {
    const countries = searchCountries(query, 4).map((country) => ({ kind: "country" as const, country }));
    const found = cities ? searchCities(cities, query, 8).map((city) => ({ kind: "city" as const, city })) : [];
    return [...countries, ...found];
  }, [query, cities]);
