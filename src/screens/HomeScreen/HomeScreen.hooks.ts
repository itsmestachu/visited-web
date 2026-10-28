import { useMemo } from "react";
import { countryName } from "../../data/countries";
import { comparePl } from "../../utils/text";
import type { AppData, Place, Status } from "../../store/store.types";

export const useHomeLists = (data: AppData, places: Place[], mode: Status) =>
  useMemo(() => {
    const cityCount = new Map<string, number>();
    for (const p of places) cityCount.set(p.countryCode, (cityCount.get(p.countryCode) ?? 0) + 1);
    const countryRows = Object.entries(data.countries)
      .filter(([, e]) => e.status === mode)
      .map(([code, entry]) => ({ code, entry, name: countryName(code), cities: cityCount.get(code) ?? 0 }))
      .sort((a, b) => comparePl(a.name, b.name));
    const placeRows = places.filter((p) => p.status === mode);
    return { countryRows, placeRows };
  }, [data.countries, places, mode]);
