import { Diamond, ToggleButton } from "./LayerToggle.styles";

type Props = {
  label: string;
  count?: string;
  on: boolean;
  onChange: (on: boolean) => void;
};

export function LayerToggle({ label, count, on, onChange }: Props) {
  return (
    <ToggleButton type="button" $on={on} aria-pressed={on} onClick={() => onChange(!on)} title={on ? `Ukryj ${label}` : `Pokaż ${label}`}>
      <Diamond />
      {label}
      {count && <small>{count}</small>}
    </ToggleButton>
  );
}
