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
