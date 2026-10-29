import type { UnescoSite } from "../../data/data.types";
import type { CountryEntry, Dispatch, Place, SiteEntry, Status } from "../../store/store.types";

export type CountryScreenProps = {
  code: string;
  entry: CountryEntry | undefined;
  places: Place[];
  sites: UnescoSite[] | null;
  collectedSites: Record<string, SiteEntry>;
  onSetSite: (site: UnescoSite, status: Status | null) => void;
  dispatch: Dispatch;
  onBack: () => void;
  onFocus: () => void;
  onOpenPlace: (id: string) => void;
  onRemove: () => void;
  onRemovePlace: (id: string) => void;
};
