import type { CityIndex } from "../../data/cities";
import type { City, Country } from "../../data/data.types";
import type { AppData, Place, Status } from "../../store/store.types";

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
};
