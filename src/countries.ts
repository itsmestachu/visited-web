import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import isoCountries from "i18n-iso-countries";
import pl from "i18n-iso-countries/langs/pl.json";
import en from "i18n-iso-countries/langs/en.json";
import { countries as countriesInfo } from "countries-list";
import world from "world-atlas/countries-50m.json";

isoCountries.registerLocale(pl);
isoCountries.registerLocale(en);

type Props = { name: string };

export type MapShape = {
  key: string;
  code: string | null;
  feature: Feature<Geometry, Props>;
};

export type ContinentCode = "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA";

export type Country = {
  code: string;
  name: string;
  nameEn: string;
  continent: ContinentCode | null;
  search: string;
};

export const CONTINENT_NAMES: Record<ContinentCode, string> = {
  EU: "Europa",
  AS: "Azja",
  AF: "Afryka",
  NA: "Ameryka Północna",
  SA: "Ameryka Południowa",
  OC: "Oceania",
  AN: "Antarktyda",
};

const UNOFFICIAL: Record<string, string | null> = {
  Kosovo: "XK",
  Somaliland: "SO",
  "N. Cyprus": "CY",
  "Indian Ocean Ter.": null,
  "Siachen Glacier": null,
};

const EXTRA_NAMES: Record<string, { pl: string; en: string }> = {
  XK: { pl: "Kosowo", en: "Kosovo" },
};

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l");

const topology = world as unknown as Topology<{ countries: GeometryCollection<Props> }>;
const collection = feature(topology, topology.objects.countries);

export const shapes: MapShape[] = collection.features.map((f, i) => {
  const name = f.properties.name;
  const code =
    f.id !== undefined ? isoCountries.numericToAlpha2(String(f.id)) ?? null : UNOFFICIAL[name] ?? null;
  return { key: `${f.id ?? name}-${i}`, code, feature: f };
});

const nameFor = (code: string, lang: "pl" | "en") =>
  EXTRA_NAMES[code]?.[lang] ?? isoCountries.getName(code, lang, { select: "official" }) ?? code;

const continentFor = (code: string): ContinentCode | null => {
  const info = (countriesInfo as Record<string, { continent: string } | undefined>)[code];
  return info ? (info.continent as ContinentCode) : null;
};

export const countries: Country[] = [...new Set(shapes.flatMap((s) => (s.code ? [s.code] : [])))]
  .map((code) => {
    const name = nameFor(code, "pl");
    const nameEn = nameFor(code, "en");
    const aliases = [
      ...(isoCountries.getName(code, "pl", { select: "all" }) ?? []),
      ...(isoCountries.getName(code, "en", { select: "all" }) ?? []),
    ];
    return {
      code,
      name,
      nameEn,
      continent: continentFor(code),
      search: normalize([name, nameEn, code, ...aliases].join(" ")),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "pl"));

export const countryByCode = new Map(countries.map((c) => [c.code, c]));

export const countryName = (code: string) => countryByCode.get(code)?.name ?? code;

export const searchCountries = (query: string, limit = 8): Country[] => {
  const q = normalize(query.trim());
  if (!q) return [];
  const starts: Country[] = [];
  const contains: Country[] = [];
  for (const c of countries) {
    const n = normalize(c.name);
    const e = normalize(c.nameEn);
    if (n.startsWith(q) || e.startsWith(q) || c.code.toLowerCase() === q) starts.push(c);
    else if (c.search.includes(q)) contains.push(c);
  }
  return [...starts, ...contains].slice(0, limit);
};
