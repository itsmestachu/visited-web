import type { CityIndex } from "../../data/cities";
import type { City, Landmark, UnescoSite } from "../../data/data.types";
import type { CountryEntry, Place, SiteEntry, Status, TripStop } from "../../store/store.types";

export type Focus =
  | { kind: "country"; code: string; nonce: number }
  | { kind: "point"; lng: number; lat: number; nonce: number }
  | { kind: "points"; points: [number, number][]; nonce: number };

export type ZoomState = { x: number; y: number; k: number };

export type Size = { width: number; height: number };

export type Viewport = {
  zoom: ZoomState;
  scale: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type Hover = { label: string; badge?: string; x: number; y: number };

export type Side = "right" | "left";

export type UnitPoint = { ux: number; uy: number };

export type PinItem = UnitPoint & { place: Place; x: number; y: number; side: Side | null };

export type RouteLabelSide = "right" | "left" | "top" | "bottom";

export type RouteItem = UnitPoint & {
  key: string;
  text: string;
  width: number;
  label: string | null;
  side: RouteLabelSide;
  title: string;
  site: boolean;
};

export type CountryLabelItem = UnitPoint & { code: string; text: string };

export type CityItem = UnitPoint & { city: City; side: Side };

export type LandmarkItem = UnitPoint & { landmark: Landmark; label: string; side: RouteLabelSide | null };

export type LabelLayout = { pins: PinItem[]; countryLabels: CountryLabelItem[]; cityItems: CityItem[]; landmarkItems: LandmarkItem[] };

export type ProjectedCities = { xs: Float32Array; ys: Float32Array };

export type ProjectedLandmark = { landmark: Landmark; ux: number; uy: number };

export type WorldMapProps = {
  countries: Record<string, CountryEntry>;
  places: Place[];
  cities: CityIndex | null;
  minCityPopulation: number;
  mode: Status;
  activePlaceId: string | null;
  cardPlaceId: string | null;
  focus: Focus | null;
  onCountryClick: (code: string) => void;
  onCityClick: (city: City) => void;
  onPlaceClick: (id: string) => void;
  sites: UnescoSite[] | null;
  collectedSites: Record<string, SiteEntry>;
  onSiteClick: (site: UnescoSite) => void;
  landmarks: Landmark[] | null;
  collectedLandmarks: Record<string, SiteEntry>;
  onLandmarkClick: (landmark: Landmark) => void;
  route: TripStop[] | null;
  renderPinCard: (pin: { place: Place; x: number; y: number }, area: Size) => React.ReactNode;
  overlay?: React.ReactNode;
};
