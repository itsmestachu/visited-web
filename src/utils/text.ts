export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l");

// Polish plural form: plural(1, "kraj", "kraje", "krajów") → "kraj", 3 → "kraje", 5 → "krajów".
export const plural = (n: number, one: string, few: string, many: string) => {
  if (n === 1) return one;
  const tens = n % 100;
  const units = n % 10;
  return units >= 2 && units <= 4 && (tens < 12 || tens > 14) ? few : many;
};

export const comparePl =(a: string, b: string) => a.localeCompare(b, "pl");
