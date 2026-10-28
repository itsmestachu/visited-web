import type { City } from "./data.types";
import { countryByCode } from "./countries";
import { normalize } from "../utils/text";

type Row = [number, string, string, string, number, number, number, number];

const CAPITAL_WEIGHT = 3;

export type CityIndex = {
  list: City[];
  byId: Map<number, City>;
  keys: string[][];
};

let loading: Promise<CityIndex> | null = null;

export const loadCities = (): Promise<CityIndex> => {
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}data/cities.json`)
      .then((r) => r.json() as Promise<Row[]>)
      .then((rows) => {
        const list: City[] = rows
          .filter((r) => countryByCode.has(r[3]))
          .map(([id, name, pl, cc, lat, lng, population, capital]) => ({
            id,
            name,
            namePl: pl || name,
            countryCode: cc,
            lat,
            lng,
            population,
            capital: capital === 1,
            rank: population * (capital === 1 ? CAPITAL_WEIGHT : 1),
          }))
          .sort((a, b) => b.rank - a.rank);
        const keys = list.map((c) => (c.namePl !== c.name ? [normalize(c.namePl), normalize(c.name)] : [normalize(c.name)]));
        return { list, keys, byId: new Map(list.map((c) => [c.id, c])) };
      });
  }
  return loading;
};

export const searchCities = (index: CityIndex, query: string, limit = 8): City[] => {
  const q = normalize(query.trim());
  if (q.length < 2) return [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (let i = 0; i < index.list.length; i++) {
    const keys = index.keys[i];
    if (keys.some((k) => k.startsWith(q))) {
      starts.push(index.list[i]);
      if (starts.length >= limit) break;
    } else if (q.length >= 4 && contains.length < limit && keys.some((k) => k.includes(q))) {
      contains.push(index.list[i]);
    }
  }
  return [...starts, ...contains].slice(0, limit);
};
