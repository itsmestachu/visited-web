import type { CityIndex } from "../../data/cities";
import type { UnescoIndex } from "../../data/unesco";
import type { Landmark } from "../../data/data.types";
import type { Trip, TripStop } from "../../store/store.types";

export type WishSuggestion = { key: string; label: string; toStop: (day: number) => TripStop };

export type TripScreenProps = {
  trip: Trip;
  shared: boolean;
  cities: CityIndex | null;
  unesco: UnescoIndex | null;
  landmarks: Landmark[] | null;
  suggestions: WishSuggestion[];
  shareMessage: string | null;
  onChange: (patch: Partial<Trip>) => void;
  onBack: () => void;
  onFocus: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onSave?: () => void;
};
