import type { ReactNode } from "react";
import "./Field.css";

type Props = {
  label: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export function Field({ label, action, children }: Props) {
  return (
    <div className="field">
      <div className="field-head">
        <span className="field-label">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
