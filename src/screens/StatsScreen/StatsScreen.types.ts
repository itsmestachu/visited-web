import type { AppData } from "../../store/store.types";

export type StatsScreenProps = {
  data: AppData;
  onOpenCountry: (code: string) => void;
};

export type StatTileProps = {
  value: number;
  label: string;
  big?: boolean;
  children?: React.ReactNode;
};

export type BarRowProps = {
  label: string;
  value: number;
  max: number;
  caption: string;
};
