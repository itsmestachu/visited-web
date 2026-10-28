import type { CityIndex } from "../../data/cities";
import type { Place } from "../../store/store.types";
import { countryAnchors, toScreen, visibleUnits } from "./WorldMap.projection";
import type { CityItem, CountryLabelItem, LabelLayout, PinItem, ProjectedCities, Side, Viewport } from "./WorldMap.types";

export const CITY_FONT = 12;
export const COUNTRY_FONT = 13;

const MAX_CITY_LABELS = 100;
const MAX_CITY_CANDIDATES = 8000;
const EDGE = 40;
const MAJOR_FACTOR = 2.5;
const SIDES: Side[] = ["right", "left"];

type Box = [number, number, number, number];

type PlacePoint = { place: Place; x: number; y: number };

type Placed<T> = { item: T; box: Box };

export type BaseLayout = {
  countries: Placed<CountryLabelItem>[];
  cities: Placed<CityItem>[];
};

const intersects = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

const cityTextWidth = (text: string) => text.length * CITY_FONT * 0.56;

const countryTextWidth = (text: string) => text.length * COUNTRY_FONT * 0.5;

const minRankFor = (k: number) => Math.max(5000, 3_000_000 / Math.pow(k, 1.7));

const cityBox = (x: number, y: number, width: number, side: Side): Box =>
  side === "right" ? [x - 6, y - 10, x + 12 + width, y + 10] : [x - 12 - width, y - 10, x + 6, y + 10];

const pinBox = (x: number, y: number): Box => [x - 9, y - 26, x + 9, y + 2];

const pinLabelBox = (x: number, y: number, width: number, side: Side): Box =>
  side === "right" ? [x + 9, y - 21, x + 14 + width, y - 3] : [x - 14 - width, y - 21, x - 9, y - 3];

export const computeBaseLayout = (viewport: Viewport, cities: CityIndex | null, projected: ProjectedCities | null): BaseLayout => {
  const { width, height } = viewport;
  const { k } = viewport.zoom;
  const boxes: Box[] = [];
  const tryAdd = (box: Box) => {
    if (boxes.some((b) => intersects(b, box))) return false;
    boxes.push(box);
    return true;
  };
  const onScreen = (x: number, y: number) => x >= -EDGE && y >= -EDGE && x <= width + EDGE && y <= height + EDGE;

  const placedCities: Placed<CityItem>[] = [];
  const minRank = minRankFor(k);
  const [minX, minY, maxX, maxY] = visibleUnits(viewport, EDGE);
  let cursor = 0;
  let checked = 0;

  const placeCities = (rankFloor: number) => {
    if (!cities || !projected) return;
    for (; cursor < cities.list.length; cursor++) {
      const city = cities.list[cursor];
      if (city.rank < rankFloor || placedCities.length >= MAX_CITY_LABELS || checked > MAX_CITY_CANDIDATES) return;
      const ux = projected.xs[cursor];
      const uy = projected.ys[cursor];
      if (!(ux >= minX && ux <= maxX && uy >= minY && uy <= maxY)) continue;
      const [sx, sy] = toScreen(viewport, ux, uy);
      checked++;
      const w = cityTextWidth(city.namePl);
      for (const side of SIDES) {
        const box = cityBox(sx, sy, w, side);
        if (tryAdd(box)) {
          placedCities.push({ item: { city, ux, uy, side }, box });
          break;
        }
      }
    }
  };

  placeCities(minRank * MAJOR_FACTOR);

  const placedCountries: Placed<CountryLabelItem>[] = [];
  const pxPerUnit = viewport.scale * k;
  for (const a of countryAnchors) {
    const w = countryTextWidth(a.name);
    if (a.width * pxPerUnit < w * 0.9 || a.height * pxPerUnit < 16) continue;
    const [sx, sy] = toScreen(viewport, a.x, a.y);
    if (!onScreen(sx, sy)) continue;
    const box: Box = [sx - w / 2 - 3, sy - 8, sx + w / 2 + 3, sy + 8];
    if (tryAdd(box)) placedCountries.push({ item: { code: a.code, text: a.name, ux: a.x, uy: a.y }, box });
  }

  placeCities(minRank);

  return { countries: placedCountries, cities: placedCities };
};

export const applyPins = (viewport: Viewport, base: BaseLayout, placePoints: PlacePoint[]): LabelLayout => {
  const placedCityIds = new Set(placePoints.flatMap((p) => (p.place.cityId !== undefined ? [p.place.cityId] : [])));
  const pinBoxes: Box[] = [];
  const pins: PinItem[] = [];

  for (const { place, x, y } of placePoints) {
    if (Number.isNaN(x)) continue;
    const [sx, sy] = toScreen(viewport, x, y);
    if (sx < -EDGE || sy < -EDGE || sx > viewport.width + EDGE || sy > viewport.height + EDGE) continue;
    pinBoxes.push(pinBox(sx, sy));
    pins.push({ place, ux: x, uy: y, x: sx, y: sy, side: null });
  }

  for (const pin of pins) {
    const w = cityTextWidth(pin.place.name);
    const side = SIDES.find((s) => !pinBoxes.some((b) => intersects(b, pinLabelBox(pin.x, pin.y, w, s)))) ?? null;
    if (side) {
      pin.side = side;
      pinBoxes.push(pinLabelBox(pin.x, pin.y, w, side));
    }
  }

  const free = (box: Box) => !pinBoxes.some((b) => intersects(b, box));

  return {
    pins,
    countryLabels: base.countries.filter((c) => free(c.box)).map((c) => c.item),
    cityItems: base.cities.filter((c) => !placedCityIds.has(c.item.city.id) && free(c.box)).map((c) => c.item),
  };
};
