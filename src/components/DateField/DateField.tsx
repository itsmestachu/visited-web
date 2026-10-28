import { Field } from "../Field/Field";
import { Input } from "../Field/Field.styles";
import { Segmented } from "../Segmented/Segmented";
import { Button } from "../Button/Button";
import type { DatePrecision } from "../../utils/dates";
import { useDatePrecision, useYearText } from "./DateField.hooks";
import { Row } from "./DateField.styles";
import type { DateFieldProps } from "./DateField.types";

const MAX_YEAR = new Date().getFullYear() + 20;

const PRECISIONS: { value: DatePrecision; label: string }[] = [
  { value: "year", label: "Rok" },
  { value: "month", label: "Miesiąc" },
  { value: "day", label: "Dzień" },
];

function YearInput({ value, onChange }: Pick<DateFieldProps, "value" | "onChange">) {
  const { text, change } = useYearText(value, onChange);
  return <Input type="number" min={1900} max={MAX_YEAR} placeholder="np. 2024" value={text} onChange={(e) => change(e.target.value)} />;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const { precision, changePrecision } = useDatePrecision(value, onChange);

  return (
    <Field label={label} action={<Segmented size="small" options={PRECISIONS} value={precision} onChange={changePrecision} />}>
      <Row>
        {precision === "year" && <YearInput value={value} onChange={onChange} />}
        {precision === "month" && (
          <Input
            type="month"
            value={value && value.length >= 7 ? value.slice(0, 7) : ""}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        )}
        {precision === "day" && (
          <Input type="date" value={value?.length === 10 ? value : ""} onChange={(e) => onChange(e.target.value || undefined)} />
        )}
        {value && (
          <Button variant="link" onClick={() => onChange(undefined)}>
            Wyczyść
          </Button>
        )}
      </Row>
    </Field>
  );
}
