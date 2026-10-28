export type Settings = {
  minCityPopulation: number;
};

const STORAGE_KEY = "visited-map:settings";

export const CITY_POPULATION_STEPS = [0, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

export const defaultSettings: Settings = { minCityPopulation: 0 };

export const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
};

export const formatPopulation = (n: number) => {
  if (n === 0) return "wszystkie";
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("pl-PL")} mln`;
  return `${(n / 1000).toLocaleString("pl-PL")} tys.`;
};
