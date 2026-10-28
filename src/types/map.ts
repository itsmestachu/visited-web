export type Focus =
  | { kind: "country"; code: string; nonce: number }
  | { kind: "point"; lng: number; lat: number; nonce: number };

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

export type CountryLabel = { kind: "country"; code: string; text: string; x: number; y: number };

export type CityLabel = { kind: "city"; cityId: number; text: string; x: number; y: number };

export type PinLabel = { placeId: string; text: string };
