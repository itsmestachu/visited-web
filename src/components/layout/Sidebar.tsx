import type { ReactNode } from "react";
import { ProgressBar } from "../../ui/ProgressBar";
import "./Sidebar.css";

export type SidebarTab = "map" | "stats";

type Props = {
  tab: SidebarTab;
  onTab: (tab: SidebarTab) => void;
  visited: number;
  total: number;
  children: ReactNode;
};

export function Sidebar({ tab, onTab, visited, total, children }: Props) {
  const percent = Math.round((visited / total) * 100);
  return (
    <aside className="sidebar">
      <header className="sidebar-head">
        <div className="sidebar-title-row">
          <h1>Moja mapa podróży</h1>
          <div className="sidebar-tabs">
            <button type="button" className={tab === "map" ? "active" : undefined} onClick={() => onTab("map")}>
              Mapa
            </button>
            <button type="button" className={tab === "stats" ? "active" : undefined} onClick={() => onTab("stats")}>
              Statystyki
            </button>
          </div>
        </div>
        <p className="sidebar-count">
          <strong>{visited}</strong> z {total} krajów · {percent}%
        </p>
        <ProgressBar value={percent} />
      </header>
      <div className="sidebar-body">{children}</div>
    </aside>
  );
}
