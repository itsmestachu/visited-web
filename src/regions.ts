import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import regionIndex from "./data/regions-index.json";

export type Region = {
  id: string;
  name: string;
  feature: Feature<Geometry, { id: string; n: string }>;
};

export const regionCount = regionIndex as Record<string, number>;

export const hasRegions = (code: string) => code in regionCount;

const cache = new Map<string, Region[]>();
const pending = new Map<string, Promise<Region[]>>();

export const loadRegions = (code: string): Promise<Region[]> => {
  const cached = cache.get(code);
  if (cached) return Promise.resolve(cached);
  let p = pending.get(code);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}data/regions/${code}.json`)
      .then((r) => r.json())
      .then((t: Topology<{ regions: GeometryCollection<{ id: string; n: string }> }>) => {
        const regions = feature(t, t.objects.regions)
          .features.map((f) => ({ id: f.properties.id, name: f.properties.n, feature: f }))
          .sort((a, b) => a.name.localeCompare(b.name, "pl"));
        cache.set(code, regions);
        return regions;
      });
    pending.set(code, p);
  }
  return p;
};

export const useRegions = (code: string | null) => {
  const [loaded, setLoaded] = useState<{ code: string; regions: Region[] } | null>(null);
  useEffect(() => {
    if (!code || !hasRegions(code)) return;
    let alive = true;
    loadRegions(code).then((regions) => {
      if (alive) setLoaded({ code, regions });
    });
    return () => {
      alive = false;
    };
  }, [code]);
  return loaded && loaded.code === code ? loaded.regions : null;
};

export const useRegionsFor = (codes: string[]) => {
  const key = [...codes].sort().join(",");
  const [map, setMap] = useState<Map<string, Region[]>>(() => new Map());
  useEffect(() => {
    let alive = true;
    const list = key ? key.split(",") : [];
    Promise.all(list.map((c) => loadRegions(c).then((r) => [c, r] as const))).then((entries) => {
      if (alive) setMap(new Map(entries));
    });
    return () => {
      alive = false;
    };
  }, [key]);
  return map;
};
