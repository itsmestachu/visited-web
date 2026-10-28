import { Field } from "../Field/Field";
import { TextArea } from "../Field/Field.styles";

type Props = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

export function NoteField({ value, onChange }: Props) {
  return (
    <Field label="Notatka">
      <TextArea
        rows={3}
        placeholder="Wspomnienia, polecane miejsca, z kim byłeś…"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
      />
    </Field>
  );
}
