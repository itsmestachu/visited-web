import { PALETTE, randomColor } from "../../constants/palette";
import { Field } from "../../ui/Field";
import { Button } from "../../ui/Button";
import "./ColorPicker.css";

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  return (
    <Field
      label="Kolor na mapie"
      action={
        <Button variant="link" onClick={() => onChange(randomColor())}>
          🎲 Losuj
        </Button>
      }
    >
      <div className="swatches">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            className={c === value ? "swatch active" : "swatch"}
            style={{ background: c }}
            onClick={() => onChange(c)}
            aria-label={`Kolor ${c}`}
          />
        ))}
      </div>
    </Field>
  );
}
