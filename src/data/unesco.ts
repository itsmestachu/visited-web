import type { SiteCategory, UnescoSite } from "./data.types";

type Row = [number, string, string, number, number, number, SiteCategory, number];

export const UNESCO = "unesco";

export const CATEGORY_LABEL: Record<SiteCategory, string> = { C: "kulturowe", N: "przyrodnicze", M: "mieszane" };

export type UnescoIndex = {
  list: UnescoSite[];
  byCountry: Map<string, UnescoSite[]>;
};

let loading: Promise<UnescoIndex> | null = null;

export const loadUnesco = (): Promise<UnescoIndex> => {
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}data/unesco.json`)
      .then((r) => r.json() as Promise<Row[]>)
      .then((rows) => {
        const list: UnescoSite[] = rows.map(([id, name, codes, lat, lng, year, category, danger]) => ({
          id: String(id),
          name,
          countryCodes: codes.split(","),
          lat,
          lng,
          year,
          category,
          danger: danger === 1,
        }));
        const byCountry = new Map<string, UnescoSite[]>();
        for (const site of list) {
          for (const code of site.countryCodes) {
            const sites = byCountry.get(code);
            if (sites) sites.push(site);
            else byCountry.set(code, [site]);
          }
        }
        return { list, byCountry };
      });
  }
  return loading;
};
