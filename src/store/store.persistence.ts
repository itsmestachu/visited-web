import type { AppData } from "./store.types";

const STORAGE_KEY = "visited-map:v1";

export const emptyData: AppData = { version: 1, countries: {}, places: {}, collections: {}, trips: {} };

const record = <T,>(value: unknown): Record<string, T> => (value && typeof value === "object" ? (value as Record<string, T>) : {});

export const parseData = (value: unknown): AppData | null => {
  if (!value || typeof value !== "object") return null;
  const d = value as Partial<AppData>;
  if (d.version !== 1 || !d.countries || typeof d.countries !== "object" || !d.places || typeof d.places !== "object") return null;
  return { ...(d as AppData), collections: record(d.collections), trips: record(d.trips) };
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    return parseData(JSON.parse(raw)) ?? emptyData;
  } catch {
    return emptyData;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
};
