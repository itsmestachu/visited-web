import type { ReactNode } from "react";

type Props = {
  value: number;
  label: string;
  big?: boolean;
  children?: ReactNode;
};

export function StatTile({ value, label, big, children }: Props) {
  return (
    <div className={big ? "stat-tile big" : "stat-tile"}>
      <span className="stat-tile-value">{value}</span>
      <span className="stat-tile-label">{label}</span>
      {children}
    </div>
  );
}
