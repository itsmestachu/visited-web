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
  cover?: string;
  createdAt: number;
};

export type SiteEntry = { status: Status };

export type TripStop = {
  id: string;
  name: string;
  countryCode: string;
  lat: number;
  lng: number;
  day: number;
  cityId?: number;
  siteId?: string;
  kind?: string;
};

export type ChecklistItem = { id: string; text: string; done: boolean };

export type Trip = {
  id: string;
  name: string;
  status: "planned" | "done";
  startDate?: string;
  endDate?: string;
  days: number;
  stops: TripStop[];
  checklist: ChecklistItem[];
  note?: string;
  cover?: string;
  createdAt: number;
};

export type AppData = {
  version: 1;
  countries: Record<string, CountryEntry>;
  places: Record<string, Place>;
  collections: Record<string, Record<string, SiteEntry>>;
  trips: Record<string, Trip>;
  profile: Profile;
};

export type Profile = { name?: string; bio?: string; avatarId?: string };

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
  | { type: "insertPhoto"; id: string; photoId: string; index: number }
  | { type: "replaceData"; data: AppData }
  | { type: "setSite"; collection: string; siteId: string; status: Status | null; countryCode?: string }
  | { type: "saveTrip"; trip: Trip }
  | { type: "updateTrip"; id: string; patch: Partial<Trip> }
  | { type: "removeTrip"; id: string }
  | { type: "updateProfile"; patch: Partial<Profile> };

export type Dispatch = (action: Action) => void;
