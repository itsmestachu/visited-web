import type { Focus } from "../components/WorldMap/WorldMap.types";

export type PanelView = { type: "home" } | { type: "country"; code: string } | { type: "place"; id: string };

export type ViewerState = { placeId: string; index: number; autoplay: boolean };

export type NavigationState = {
  view: PanelView;
  focus: Focus | null;
  cardPlaceId: string | null;
  viewer: ViewerState | null;
};
