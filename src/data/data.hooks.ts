import { useEffect, useState } from "react";
import { loadCities } from "./cities";
import { loadUnesco } from "./unesco";

const useLoaded = <T,>(load: () => Promise<T>) => {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((v) => {
      if (alive) setValue(v);
    });
    return () => {
      alive = false;
    };
  }, [load]);
  return value;
};

export const useCities = () => useLoaded(loadCities);

export const useUnesco = () => useLoaded(loadUnesco);
