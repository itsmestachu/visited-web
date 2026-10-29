import type { ReactNode } from "react";
import { Diamond, ToggleButton } from "./LayerToggle.styles";

export { Stack as LayerToggles } from "./LayerToggle.styles";

type Props = {
  label: string;
  count?: string;
  on: boolean;
  onChange: (on: boolean) => void;
  icon?: ReactNode;
};

export function LayerToggle({ label, count, on, onChange, icon = <Diamond /> }: Props) {
  return (
    <ToggleButton type="button" $on={on} aria-pressed={on} onClick={() => onChange(!on)} title={on ? `Ukryj ${label}` : `Pokaż ${label}`}>
      {icon}
      {label}
      {count && <small>{count}</small>}
    </ToggleButton>
  );
}
