import type { AppData } from "../types/models";

const STORAGE_KEY = "visited-map:v1";

export const emptyData: AppData = { version: 1, countries: {}, places: {} };

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as AppData;
    return parsed.version === 1 ? parsed : emptyData;
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
