import { countryByCode } from "./countries";
import type { Landmark, LandmarkCategory } from "./data.types";

type Row = [string, string, string, number, number, number, LandmarkCategory];

export const LANDMARKS = "landmarks";

export const LANDMARK_LABEL: Record<LandmarkCategory, string> = {
  tower: "wieża",
  skyscraper: "wieżowiec",
  castle: "zamek",
  palace: "pałac",
  church: "kościół",
  mosque: "meczet",
  temple: "świątynia",
  museum: "muzeum",
  bridge: "most",
  monument: "pomnik",
  ruins: "zabytek",
  stadium: "stadion",
  theatre: "teatr",
  lighthouse: "latarnia morska",
  nature: "przyroda",
  attraction: "atrakcja",
};

let loading: Promise<Landmark[]> | null = null;

// Sorted by fame (number of Wikipedia editions), most famous first.
export const loadLandmarks = (): Promise<Landmark[]> => {
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}data/landmarks.json`)
      .then((r) => r.json() as Promise<Row[]>)
      .then((rows) =>
        rows
          .filter((r) => countryByCode.has(r[2]))
          .map(([id, name, countryCode, lat, lng, links, category]) => ({ id, name, countryCode, lat, lng, links, category })),
      );
  }
  return loading;
};
