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
