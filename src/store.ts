import { useEffect, useReducer } from "react";
import type { City } from "./cities";

export type Status = "visited" | "wish";

export type CountryEntry = {
  status: Status;
  color: string;
  date?: string;
  note?: string;
  regions?: string[];
};

export type Place = {
  id: string;
  cityId?: number;
  name: string;
  countryCode: string;
  lat: number;
  lng: number;
  status: Status;
  date?: string;
  note?: string;
  photos: string[];
  createdAt: number;
};

export type AppData = {
  version: 1;
  countries: Record<string, CountryEntry>;
  places: Record<string, Place>;
};

export const PALETTE = [
  "#e4572e",
  "#f3a712",
  "#29a19c",
  "#4c6ef5",
  "#9c36b5",
  "#e64980",
  "#2b8a3e",
  "#f76707",
  "#1c7ed6",
  "#c2255c",
  "#5f3dc4",
  "#0ca678",
];

export const randomColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];

const STORAGE_KEY = "visited-map:v1";

const empty: AppData = { version: 1, countries: {}, places: {} };

const load = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version !== 1) return empty;
    return parsed;
  } catch {
    return empty;
  }
};

type Action =
  | { type: "clickCountry"; code: string; mode: Status }
  | { type: "ensureCountry"; code: string; status: Status }
  | { type: "removeCountry"; code: string }
  | { type: "updateCountry"; code: string; patch: Partial<CountryEntry> }
  | { type: "toggleRegion"; code: string; regionId: string }
  | { type: "addPlace"; place: Place }
  | { type: "updatePlace"; id: string; patch: Partial<Place> }
  | { type: "removePlace"; id: string }
  | { type: "addPhotos"; id: string; photoIds: string[] }
  | { type: "removePhoto"; id: string; photoId: string };

const withCountry = (data: AppData, code: string, entry: CountryEntry | undefined): AppData => {
  const countries = { ...data.countries };
  if (entry) countries[code] = entry;
  else delete countries[code];
  return { ...data, countries };
};

const withPlace = (data: AppData, id: string, place: Place | undefined): AppData => {
  const places = { ...data.places };
  if (place) places[id] = place;
  else delete places[id];
  return { ...data, places };
};

const ensureVisited = (data: AppData, code: string): AppData => {
  const current = data.countries[code];
  if (current?.status === "visited") return data;
  return withCountry(data, code, { ...current, status: "visited", color: current?.color ?? randomColor() });
};

const reducer = (data: AppData, action: Action): AppData => {
  switch (action.type) {
    case "clickCountry": {
      const current = data.countries[action.code];
      if (!current) return withCountry(data, action.code, { status: action.mode, color: randomColor() });
      if (current.status === action.mode) return withCountry(data, action.code, undefined);
      return withCountry(data, action.code, { ...current, status: action.mode });
    }
    case "ensureCountry": {
      const current = data.countries[action.code];
      if (current) return data;
      return withCountry(data, action.code, { status: action.status, color: randomColor() });
    }
    case "removeCountry":
      return withCountry(data, action.code, undefined);
    case "updateCountry": {
      const current = data.countries[action.code];
      if (!current) return data;
      return withCountry(data, action.code, { ...current, ...action.patch });
    }
    case "toggleRegion": {
      const next = ensureVisited(data, action.code);
      const current = next.countries[action.code];
      const regions = current.regions ?? [];
      const updated = regions.includes(action.regionId)
        ? regions.filter((r) => r !== action.regionId)
        : [...regions, action.regionId];
      return withCountry(next, action.code, { ...current, regions: updated });
    }
    case "addPlace": {
      const next = withPlace(data, action.place.id, action.place);
      if (action.place.status === "visited") return ensureVisited(next, action.place.countryCode);
      if (!next.countries[action.place.countryCode])
        return withCountry(next, action.place.countryCode, { status: "wish", color: randomColor() });
      return next;
    }
    case "updatePlace": {
      const current = data.places[action.id];
      if (!current) return data;
      const next = withPlace(data, action.id, { ...current, ...action.patch });
      return action.patch.status === "visited" ? ensureVisited(next, current.countryCode) : next;
    }
    case "removePlace":
      return withPlace(data, action.id, undefined);
    case "addPhotos": {
      const current = data.places[action.id];
      if (!current) return data;
      return withPlace(data, action.id, { ...current, photos: [...current.photos, ...action.photoIds] });
    }
    case "removePhoto": {
      const current = data.places[action.id];
      if (!current) return data;
      return withPlace(data, action.id, {
        ...current,
        photos: current.photos.filter((p) => p !== action.photoId),
      });
    }
  }
};

export const placeFromCity = (city: City, status: Status): Place => ({
  id: crypto.randomUUID(),
  cityId: city.id,
  name: city.namePl,
  countryCode: city.countryCode,
  lat: city.lat,
  lng: city.lng,
  status,
  photos: [],
  createdAt: Date.now(),
});

export const useAppData = () => {
  const [data, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      return;
    }
  }, [data]);
  return [data, dispatch] as const;
};

export type Dispatch = ReturnType<typeof useAppData>[1];
