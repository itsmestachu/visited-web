export type Status = "visited" | "wish";

export type CountryEntry = {
  status: Status;
  color: string;
  date?: string;
  note?: string;
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

export type Action =
  | { type: "clickCountry"; code: string; mode: Status }
  | { type: "ensureCountry"; code: string; status: Status }
  | { type: "removeCountry"; code: string }
  | { type: "restoreCountry"; code: string; entry: CountryEntry }
  | { type: "updateCountry"; code: string; patch: Partial<CountryEntry> }
  | { type: "addPlace"; place: Place }
  | { type: "restorePlace"; place: Place }
  | { type: "updatePlace"; id: string; patch: Partial<Place> }
  | { type: "removePlace"; id: string }
  | { type: "addPhotos"; id: string; photoIds: string[] }
  | { type: "removePhoto"; id: string; photoId: string }
  | { type: "insertPhoto"; id: string; photoId: string; index: number };

export type Dispatch = (action: Action) => void;
