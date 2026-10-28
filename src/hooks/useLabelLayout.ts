import { useMemo } from "react";
import type { CityIndex } from "../data/cities";
import type { City } from "../types/geo";
import type { Place } from "../types/models";
import type { Viewport } from "../types/map";
import { countryAnchors, projection, toScreen } from "../components/map/projection";

export const CITY_FONT = 12;
export const COUNTRY_FONT = 10.5;

const MAX_CITY_LABELS = 100;
const MAX_CITY_CANDIDATES = 8000;
const EDGE = 4;
const MAJOR_FACTOR = 2.5;

type Box = [number, number, number, number];
export type Side = "right" | "left";

export type PinItem = { place: Place; x: number; y: number; side: Side | null };
export type CountryLabelItem = { code: string; text: string; x: number; y: number };
export type CityItem = { city: City; x: number; y: number; side: Side };

const intersects = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

const textWidth = (text: string, font: number, upper = false) => text.length * font * (upper ? 0.74 : 0.56);

const minPopulation = (k: number) => Math.max(5000, 3_000_000 / Math.pow(k, 1.7));

class Occupancy {
  private boxes: Box[] = [];
  free(box: Box) {
    return !this.boxes.some((b) => intersects(b, box));
  }
  add(box: Box) {
    this.boxes.push(box);
  }
}

const sideBox = (x: number, y: number, width: number, side: Side): Box =>
  side === "right" ? [x - 6, y - 10, x + 12 + width, y + 10] : [x - 12 - width, y - 10, x + 6, y + 10];

export const useLabelLayout = (viewport: Viewport, cities: CityIndex | null, places: Place[]) => {
  const projected = useMemo(() => {
    if (!cities) return null;
    const xs = new Float32Array(cities.list.length);
    const ys = new Float32Array(cities.list.length);
    cities.list.forEach((c, i) => {
      const p = projection([c.lng, c.lat]);
      xs[i] = p ? p[0] : NaN;
      ys[i] = p ? p[1] : NaN;
    });
    return { xs, ys };
  }, [cities]);

  const placePoints = useMemo(
    () =>
      places.map((place) => {
        const p = projection([place.lng, place.lat]);
        return { place, x: p ? p[0] : NaN, y: p ? p[1] : NaN };
      }),
    [places],
  );

  return useMemo(() => {
    const { width, height } = viewport;
    const { k } = viewport.zoom;
    const occupied = new Occupancy();
    const onScreen = (x: number, y: number) => x >= -EDGE && y >= -EDGE && x <= width + EDGE && y <= height + EDGE;

    const pins: PinItem[] = [];
    for (const { place, x, y } of placePoints) {
      if (Number.isNaN(x)) continue;
      const [sx, sy] = toScreen(viewport, x, y);
      if (!onScreen(sx, sy)) continue;
      occupied.add([sx - 8, sy - 24, sx + 8, sy + 2]);
      pins.push({ place, x: sx, y: sy, side: null });
    }
    for (const pin of pins) {
      const w = textWidth(pin.place.name, CITY_FONT);
      for (const side of ["right", "left"] as const) {
        const box: Box = side === "right" ? [pin.x + 9, pin.y - 20, pin.x + 13 + w, pin.y - 4] : [pin.x - 13 - w, pin.y - 20, pin.x - 9, pin.y - 4];
        if (occupied.free(box)) {
          occupied.add(box);
          pin.side = side;
          break;
        }
      }
    }

    const cityItems: CityItem[] = [];
    const minRank = minPopulation(k);
    const placedCityIds = new Set(places.flatMap((p) => (p.cityId !== undefined ? [p.cityId] : [])));
    let cursor = 0;
    let checked = 0;

    const placeCities = (rankFloor: number) => {
      if (!cities || !projected) return;
      for (; cursor < cities.list.length; cursor++) {
        const city = cities.list[cursor];
        if (city.rank < rankFloor || cityItems.length >= MAX_CITY_LABELS || checked > MAX_CITY_CANDIDATES) return;
        if (placedCityIds.has(city.id)) continue;
        const x = projected.xs[cursor];
        if (Number.isNaN(x)) continue;
        const [sx, sy] = toScreen(viewport, x, projected.ys[cursor]);
        if (!onScreen(sx, sy)) continue;
        checked++;
        const w = textWidth(city.namePl, CITY_FONT);
        for (const side of ["right", "left"] as const) {
          const box = sideBox(sx, sy, w, side);
          if (occupied.free(box)) {
            occupied.add(box);
            cityItems.push({ city, x: sx, y: sy, side });
            break;
          }
        }
      }
    };

    placeCities(minRank * MAJOR_FACTOR);

    const countryLabels: CountryLabelItem[] = [];
    const pxPerUnit = viewport.scale * k;
    for (const a of countryAnchors) {
      const w = textWidth(a.name, COUNTRY_FONT, true);
      if (a.width * pxPerUnit < w * 0.85 || a.height * pxPerUnit < 14) continue;
      const [sx, sy] = toScreen(viewport, a.x, a.y);
      if (!onScreen(sx, sy)) continue;
      const box: Box = [sx - w / 2 - 2, sy - 7, sx + w / 2 + 2, sy + 7];
      if (!occupied.free(box)) continue;
      occupied.add(box);
      countryLabels.push({ code: a.code, text: a.name, x: sx, y: sy });
    }

    placeCities(minRank);

    return { pins, countryLabels, cityItems };
  }, [viewport, cities, projected, placePoints, places]);
};
