import { countryByCode, normalize } from "./countries";

export type City = {
  id: number;
  name: string;
  namePl: string;
  countryCode: string;
  lat: number;
  lng: number;
  population: number;
};

type Row = [number, string, string, string, number, number, number];
type Indexed = { city: City; keys: string[] };

let index: Indexed[] | null = null;
let loading: Promise<Indexed[]> | null = null;

export const loadCities = (): Promise<Indexed[]> => {
  if (index) return Promise.resolve(index);
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}data/cities.json`)
      .then((r) => r.json() as Promise<Row[]>)
      .then((rows) => {
        index = rows
          .filter((r) => countryByCode.has(r[3]))
          .map(([id, name, pl, cc, lat, lng, population]) => {
            const city: City = { id, name, namePl: pl || name, countryCode: cc, lat, lng, population };
            return { city, keys: pl ? [normalize(pl), normalize(name)] : [normalize(name)] };
          });
        return index;
      });
  }
  return loading;
};

export const citiesReady = () => index !== null;

export const searchCities = (query: string, limit = 8): City[] => {
  const q = normalize(query.trim());
  if (!index || q.length < 2) return [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (const { city, keys } of index) {
    if (keys.some((k) => k.startsWith(q))) {
      starts.push(city);
      if (starts.length >= limit) break;
    } else if (q.length >= 4 && contains.length < limit && keys.some((k) => k.includes(q))) {
      contains.push(city);
    }
  }
  return [...starts, ...contains].slice(0, limit);
};
