export type PanelView = { type: "home" } | { type: "country"; code: string } | { type: "place"; id: string };

export type ViewerState = { placeId: string; index: number; autoplay: boolean };
