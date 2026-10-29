import type { AppData } from "../../store/store.types";

export type BackupSectionProps = {
  busy: boolean;
  error: string | null;
  onExport: () => void;
  onImport: (file: File) => void;
};

export type StatsScreenProps = {
  data: AppData;
  unescoTotal: number;
  landmarksTotal: number;
  backup: BackupSectionProps;
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
