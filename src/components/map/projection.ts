import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, Geometry, Polygon } from "geojson";
import { shapes, countryName } from "../../data/countries";
import type { Size, Viewport, ZoomState } from "../../types/map";

export const WIDTH = 960;
export const HEIGHT = 500;
export const MAX_ZOOM = 80;

export const projection = geoNaturalEarth1().fitExtent(
  [
    [8, 8],
    [WIDTH - 8, HEIGHT - 8],
  ],
  { type: "Sphere" },
);

export const path = geoPath(projection);

export const spherePath = path({ type: "Sphere" }) ?? "";

const mainPolygon = (f: Feature<Geometry>): Feature<Polygon> | null => {
  const g = f.geometry;
  const polygons: Polygon[] =
    g.type === "Polygon"
      ? [g]
      : g.type === "MultiPolygon"
        ? g.coordinates.map((coordinates) => ({ type: "Polygon", coordinates }))
        : [];
  let best: Feature<Polygon> | null = null;
  let bestArea = -1;
  for (const geometry of polygons) {
    const candidate: Feature<Polygon> = { type: "Feature", properties: {}, geometry };
    const area = path.area(candidate);
    if (area > bestArea) {
      bestArea = area;
      best = candidate;
    }
  }
  return best;
};

export type CountryGeometry = {
  key: string;
  code: string | null;
  d: string;
};

export type CountryAnchor = {
  code: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  bounds: [[number, number], [number, number]];
};

export const countryGeometries: CountryGeometry[] = shapes.map((s) => ({
  key: s.key,
  code: s.code,
  d: path(s.feature) ?? "",
}));

const anchorsByCode = new Map<string, CountryAnchor>();
for (const s of shapes) {
  if (!s.code) continue;
  const main = mainPolygon(s.feature);
  if (!main) continue;
  const area = path.area(main);
  const existing = anchorsByCode.get(s.code);
  if (existing && existing.area >= area) continue;
  const bounds = path.bounds(main);
  const [x, y] = path.centroid(main);
  anchorsByCode.set(s.code, {
    code: s.code,
    name: countryName(s.code),
    x,
    y,
    width: bounds[1][0] - bounds[0][0],
    height: bounds[1][1] - bounds[0][1],
    area,
    bounds,
  });
}

export const countryAnchors = [...anchorsByCode.values()].sort((a, b) => b.area - a.area);

export const anchorFor = (code: string) => anchorsByCode.get(code);

export const createViewport = (zoom: ZoomState, size: Size): Viewport => {
  const scale = Math.min(size.width / WIDTH, size.height / HEIGHT) || 1;
  return {
    zoom,
    scale,
    offsetX: (size.width - WIDTH * scale) / 2,
    offsetY: (size.height - HEIGHT * scale) / 2,
    width: size.width,
    height: size.height,
  };
};

export const toScreen = (v: Viewport, x: number, y: number): [number, number] => [
  v.offsetX + v.scale * (v.zoom.x + v.zoom.k * x),
  v.offsetY + v.scale * (v.zoom.y + v.zoom.k * y),
];
