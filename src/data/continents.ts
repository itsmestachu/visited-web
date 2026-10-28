import type { ContinentCode } from "./data.types";

export const CONTINENT_ORDER: ContinentCode[] = ["EU", "AS", "AF", "NA", "SA", "OC", "AN"];

export const CONTINENT_NAMES: Record<ContinentCode, string> = {
  EU: "Europa",
  AS: "Azja",
  AF: "Afryka",
  NA: "Ameryka Północna",
  SA: "Ameryka Południowa",
  OC: "Oceania",
  AN: "Antarktyda",
};
