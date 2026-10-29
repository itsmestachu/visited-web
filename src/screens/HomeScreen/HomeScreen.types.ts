import type { CityIndex } from "../../data/cities";
import type { City, Country, LandmarkCategory } from "../../data/data.types";
import type { AppData, Place, Status } from "../../store/store.types";

// A marked landmark or UNESCO site, ready for the list.
export type CollectedRow = {
  key: string;
  id: string;
  name: string;
  countryCodes: string[];
  lat: number;
  lng: number;
  status: Status;
  category?: LandmarkCategory;
};

export type HomeScreenProps = {
  data: AppData;
  places: Place[];
  cities: CityIndex | null;
  mode: Status;
  onPickCountry: (country: Country) => void;
  onPickCity: (city: City) => void;
  onOpenCountry: (code: string) => void;
  onOpenPlace: (id: string) => void;
  onRemoveCountry: (code: string) => void;
  onRemovePlace: (id: string) => void;
  landmarkRows: CollectedRow[];
  siteRows: CollectedRow[];
  onOpenCollected: (row: CollectedRow) => void;
  onRemoveLandmark: (row: CollectedRow) => void;
  onRemoveSite: (row: CollectedRow) => void;
};
