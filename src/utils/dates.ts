const monthFormat = new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" });
const dayFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

export const formatDate = (value: string | undefined) => {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  if (value.length === 4) return String(y);
  if (value.length === 7) return monthFormat.format(new Date(y, m - 1, 1));
  return dayFormat.format(new Date(y, m - 1, d));
};

export const yearOf = (value: string | undefined) => (value ? Number(value.slice(0, 4)) : null);

export type DatePrecision = "year" | "month" | "day";

export const precisionOf = (value: string | undefined): DatePrecision =>
  !value || value.length === 10 ? "day" : value.length === 7 ? "month" : "year";

export const convertPrecision = (value: string | undefined, to: DatePrecision) => {
  if (!value) return undefined;
  const y = value.slice(0, 4);
  const m = value.slice(5, 7) || "01";
  const d = value.slice(8, 10) || "01";
  if (to === "year") return y;
  if (to === "month") return `${y}-${m}`;
  return `${y}-${m}-${d}`;
};
