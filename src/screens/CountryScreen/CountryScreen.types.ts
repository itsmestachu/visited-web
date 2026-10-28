import type { CountryEntry, Dispatch, Place } from "../../store/store.types";

export type CountryScreenProps = {
  code: string;
  entry: CountryEntry | undefined;
  places: Place[];
  dispatch: Dispatch;
  onBack: () => void;
  onFocus: () => void;
  onOpenPlace: (id: string) => void;
  onRemove: () => void;
  onRemovePlace: (id: string) => void;
};
