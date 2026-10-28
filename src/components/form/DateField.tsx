import { useState } from "react";
import { Field } from "../../ui/Field";
import { Segmented } from "../../ui/Segmented";
import { Button } from "../../ui/Button";
import { YearInput } from "./YearInput";
import { convertPrecision, precisionOf, type DatePrecision } from "../../utils/dates";
import "./DateField.css";

const MAX_YEAR = new Date().getFullYear() + 20;

const PRECISIONS: { value: DatePrecision; label: string }[] = [
  { value: "year", label: "Rok" },
  { value: "month", label: "Miesiąc" },
  { value: "day", label: "Dzień" },
];

type Props = {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

export function DateField({ label, value, onChange }: Props) {
  const [precision, setPrecision] = useState<DatePrecision>(() => precisionOf(value));

  const changePrecision = (p: DatePrecision) => {
    setPrecision(p);
    onChange(convertPrecision(value, p));
  };

  return (
    <Field label={label} action={<Segmented size="small" options={PRECISIONS} value={precision} onChange={changePrecision} />}>
      <div className="date-row">
        {precision === "year" && <YearInput value={value} onChange={onChange} max={MAX_YEAR} />}
        {precision === "month" && (
          <input
            type="month"
            value={value && value.length >= 7 ? value.slice(0, 7) : ""}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        )}
        {precision === "day" && (
          <input type="date" value={value?.length === 10 ? value : ""} onChange={(e) => onChange(e.target.value || undefined)} />
        )}
        {value && (
          <Button variant="link" onClick={() => onChange(undefined)}>
            Wyczyść
          </Button>
        )}
      </div>
    </Field>
  );
}
