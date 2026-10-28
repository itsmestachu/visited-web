import type { AppData, CountryEntry, Place } from "../types/models";
import type { Action } from "./actions";
import { randomColor } from "../constants/palette";

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

export const reducer = (data: AppData, action: Action): AppData => {
  switch (action.type) {
    case "clickCountry": {
      const current = data.countries[action.code];
      if (!current) return withCountry(data, action.code, { status: action.mode, color: randomColor() });
      if (current.status === action.mode) return withCountry(data, action.code, undefined);
      return withCountry(data, action.code, { ...current, status: action.mode });
    }
    case "ensureCountry":
      if (data.countries[action.code]) return data;
      return withCountry(data, action.code, { status: action.status, color: randomColor() });
    case "removeCountry":
      return withCountry(data, action.code, undefined);
    case "updateCountry": {
      const current = data.countries[action.code];
      if (!current) return data;
      return withCountry(data, action.code, { ...current, ...action.patch });
    }
    case "addPlace": {
      const next = withPlace(data, action.place.id, action.place);
      const code = action.place.countryCode;
      if (action.place.status === "visited") return ensureVisited(next, code);
      if (!next.countries[code]) return withCountry(next, code, { status: "wish", color: randomColor() });
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
      return withPlace(data, action.id, { ...current, photos: current.photos.filter((p) => p !== action.photoId) });
    }
  }
};
