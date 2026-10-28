import { countryByCode } from "../../data/countries";
import { CONTINENT_NAMES } from "../../data/continents";

export const useCountryInfo = (code: string) => {
  const country = countryByCode.get(code);
  const subtitle = [
    country?.continent ? CONTINENT_NAMES[country.continent] : "",
    country && country.nameEn !== country.name ? country.nameEn : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return { name: country?.name ?? code, subtitle };
};
