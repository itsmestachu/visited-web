import { useMemo } from "react";
import type { AppData } from "../types/models";
import { countries, countryName } from "../data/countries";
import { CONTINENT_NAMES, CONTINENT_ORDER } from "../constants/continents";
import { yearOf } from "../utils/dates";
import { comparePl } from "../utils/text";

export const useTravelStats = (data: AppData) =>
  useMemo(() => {
    const entries = Object.entries(data.countries);
    const visited = entries.filter(([, e]) => e.status === "visited").map(([c]) => c);
    const wish = entries
      .filter(([, e]) => e.status === "wish")
      .map(([c]) => c)
      .sort((a, b) => comparePl(countryName(a), countryName(b)));
    const places = Object.values(data.places);
    const visitedPlaces = places.filter((p) => p.status === "visited");
    const photos = places.reduce((n, p) => n + p.photos.length, 0);

    const continents = CONTINENT_ORDER.map((code) => {
      const all = countries.filter((c) => c.continent === code);
      const done = all.filter((c) => data.countries[c.code]?.status === "visited").length;
      return { code, name: CONTINENT_NAMES[code], done, total: all.length };
    }).filter((c) => c.total > 0);

    const years = new Map<number, { countries: Set<string>; places: number }>();
    const bucket = (y: number) => {
      const existing = years.get(y);
      if (existing) return existing;
      const created = { countries: new Set<string>(), places: 0 };
      years.set(y, created);
      return created;
    };
    for (const [code, e] of entries) {
      const y = e.status === "visited" ? yearOf(e.date) : null;
      if (y) bucket(y).countries.add(code);
    }
    for (const p of visitedPlaces) {
      const y = yearOf(p.date);
      if (!y) continue;
      const b = bucket(y);
      b.places++;
      b.countries.add(p.countryCode);
    }
    const yearRows = [...years.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, b]) => ({ year, countries: b.countries.size, places: b.places }));

    return {
      visited: visited.length,
      total: countries.length,
      percent: Math.round((visited.length / countries.length) * 1000) / 10,
      wish,
      cities: visitedPlaces.length,
      photos,
      continents,
      continentsVisited: continents.filter((c) => c.done > 0).length,
      yearRows,
      maxYearCountries: Math.max(1, ...yearRows.map((r) => r.countries)),
    };
  }, [data]);
