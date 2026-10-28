import type { ReactNode } from "react";
import "./ListRow.css";

type Props = {
  marker: ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  onClick: () => void;
};

export function ListRow({ marker, title, subtitle, meta, onClick }: Props) {
  return (
    <li className="list-row">
      <button type="button" onClick={onClick}>
        {marker}
        <span className="list-row-main">
          <span>{title}</span>
          {subtitle && <span className="list-row-sub">{subtitle}</span>}
        </span>
        {meta && <span className="list-row-meta">{meta}</span>}
      </button>
    </li>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <ul className="list">{children}</ul>;
}
