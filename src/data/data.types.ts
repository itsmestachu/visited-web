import type { Feature, Geometry } from "geojson";

export type ContinentCode = "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA";

export type Country = {
  code: string;
  name: string;
  nameEn: string;
  continent: ContinentCode | null;
  search: string;
};

export type MapShape = {
  key: string;
  code: string | null;
  feature: Feature<Geometry, { name: string }>;
};

export type SiteCategory = "C" | "N" | "M";

export type UnescoSite = {
  id: string;
  name: string;
  countryCodes: string[];
  lat: number;
  lng: number;
  year: number;
  category: SiteCategory;
  danger: boolean;
};

export type City = {
  id: number;
  name: string;
  namePl: string;
  countryCode: string;
  lat: number;
  lng: number;
  population: number;
  capital: boolean;
  rank: number;
};
