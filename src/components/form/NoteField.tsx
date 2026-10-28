import { Field } from "../../ui/Field";

type Props = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

export function NoteField({ value, onChange }: Props) {
  return (
    <Field label="Notatka">
      <textarea
        rows={3}
        placeholder="Opcjonalnie: wspomnienia, polecane miejsca, z kim byłeś…"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
      />
    </Field>
  );
}
