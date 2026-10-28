import { useState } from "react";
import { convertPrecision, precisionOf, type DatePrecision } from "../../utils/dates";

export const useDatePrecision = (value: string | undefined, onChange: (value: string | undefined) => void) => {
  const [precision, setPrecision] = useState<DatePrecision>(() => precisionOf(value));
  const changePrecision = (p: DatePrecision) => {
    setPrecision(p);
    onChange(convertPrecision(value, p));
  };
  return { precision, changePrecision };
};

export const useYearText = (value: string | undefined, onChange: (value: string | undefined) => void) => {
  const [text, setText] = useState(value ? value.slice(0, 4) : "");
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setText(value ? value.slice(0, 4) : "");
  }
  const change = (v: string) => {
    setText(v);
    if (/^\d{4}$/.test(v)) {
      setSynced(v);
      onChange(v);
    } else if (v === "") {
      setSynced(undefined);
      onChange(undefined);
    }
  };
  return { text, change };
};
