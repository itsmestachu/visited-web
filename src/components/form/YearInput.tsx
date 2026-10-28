import { useState } from "react";

type Props = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  max: number;
};

export function YearInput({ value, onChange, max }: Props) {
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
