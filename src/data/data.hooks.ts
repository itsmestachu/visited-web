import { useEffect, useState } from "react";
import { loadCities, type CityIndex } from "./cities";

export const useCities = () => {
  const [index, setIndex] = useState<CityIndex | null>(null);
  useEffect(() => {
    let alive = true;
    loadCities().then((i) => {
      if (alive) setIndex(i);
    });
    return () => {
      alive = false;
    };
  }, []);
  return index;
};
