import type { Place } from "../../store/store.types";
import type { Size } from "../WorldMap/WorldMap.types";

export type PlaceCardProps = {
  place: Place;
  x: number;
  y: number;
  area: Size;
  onAddPhotos: (files: FileList | null) => void;
  uploading: { done: number; total: number } | null;
  onOpenPhoto: (index: number, autoplay: boolean) => void;
  onDeletePhoto: (photoId: string) => void;
  onDelete: () => void;
  onClose: () => void;
};
