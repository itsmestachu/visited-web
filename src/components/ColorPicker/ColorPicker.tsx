import { PALETTE, randomColor } from "../../theme/palette";
import { Field } from "../Field/Field";
import { Button } from "../Button/Button";
import { Swatch, Swatches } from "./ColorPicker.styles";

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
          Losuj
        </Button>
      }
    >
      <Swatches>
        {PALETTE.map((c) => (
          <Swatch
            key={c}
            type="button"
            $active={c === value}
            style={{ background: c }}
            onClick={() => onChange(c)}
            aria-label={`Kolor ${c}`}
          />
        ))}
      </Swatches>
    </Field>
  );
}
