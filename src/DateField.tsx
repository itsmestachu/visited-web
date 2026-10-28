import { useState } from "react";

const MAX_YEAR = new Date().getFullYear() + 20;

type Precision = "year" | "month" | "day";

const precisionOf = (value: string | undefined): Precision =>
  !value || value.length === 10 ? "day" : value.length === 7 ? "month" : "year";

const convert = (value: string | undefined, to: Precision) => {
  if (!value) return undefined;
  const y = value.slice(0, 4);
  const m = value.slice(5, 7) || "01";
  const d = value.slice(8, 10) || "01";
  if (to === "year") return y;
  if (to === "month") return `${y}-${m}`;
  return `${y}-${m}-${d}`;
};

type Props = {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

export function DateField({ label, value, onChange }: Props) {
  const [precision, setPrecision] = useState<Precision>(() => precisionOf(value));

  const changePrecision = (p: Precision) => {
    setPrecision(p);
    onChange(convert(value, p));
  };

  return (
    <div className="field">
      <div className="field-head">
        <span className="field-label">{label}</span>
        <div className="segmented small">
          {(
            [
              ["year", "Rok"],
              ["month", "Miesiąc"],
              ["day", "Dzień"],
            ] as const
          ).map(([p, text]) => (
            <button
              key={p}
              type="button"
              className={precision === p ? "active" : undefined}
              onClick={() => changePrecision(p)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
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
          <button type="button" className="link-button" onClick={() => onChange(undefined)}>
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}

function YearInput({
  value,
  onChange,
  max,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  max: number;
}) {
  const [text, setText] = useState(value ? value.slice(0, 4) : "");
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setText(value ? value.slice(0, 4) : "");
  }
  return (
    <input
      type="number"
      min={1900}
      max={max}
      placeholder="np. 2024"
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        if (/^\d{4}$/.test(v)) {
          setSynced(v);
          onChange(v);
        } else if (v === "") {
          setSynced(undefined);
          onChange(undefined);
        }
      }}
    />
  );
}
