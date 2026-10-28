import type { ReactNode } from "react";

export type ListRowProps = {
  marker: ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  onClick: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
};
