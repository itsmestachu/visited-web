import type { CountryEntry, Place, Status } from "../types/models";

export type Action =
  | { type: "clickCountry"; code: string; mode: Status }
  | { type: "ensureCountry"; code: string; status: Status }
  | { type: "removeCountry"; code: string }
  | { type: "updateCountry"; code: string; patch: Partial<CountryEntry> }
  | { type: "addPlace"; place: Place }
  | { type: "updatePlace"; id: string; patch: Partial<Place> }
  | { type: "removePlace"; id: string }
  | { type: "addPhotos"; id: string; photoIds: string[] }
  | { type: "removePhoto"; id: string; photoId: string };

export type Dispatch = (action: Action) => void;
