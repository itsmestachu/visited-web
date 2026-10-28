import type { CityIndex } from "../../data/cities";
import type { City, Country } from "../../data/data.types";
import type { AppData, Status } from "../../store/store.types";

export type SearchResult = { kind: "country"; country: Country } | { kind: "city"; city: City };

export type SearchBarProps = {
  data: AppData;
  cities: CityIndex | null;
  mode: Status;
  onPickCountry: (country: Country) => void;
  onPickCity: (city: City) => void;
};

export type SearchResultRowProps = {
  result: SearchResult;
  status: Status | undefined;
  active: boolean;
  onPick: () => void;
  onHover: () => void;
};
