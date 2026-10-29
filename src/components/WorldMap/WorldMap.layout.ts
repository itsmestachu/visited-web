import type { CityIndex } from "../../data/cities";
import type { Landmark } from "../../data/data.types";
import type { Place, TripStop } from "../../store/store.types";
import { countryAnchors, projection, toScreen, visibleUnits } from "./WorldMap.projection";
import type {
  CityItem,
  CountryLabelItem,
  LabelLayout,
  LandmarkItem,
  PinItem,
  ProjectedCities,
  ProjectedLandmark,
  RouteItem,
  RouteLabelSide,
  Side,
  Viewport,
} from "./WorldMap.types";

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

type PlacedLandmark = { item: LandmarkItem; box: Box; labelBox: Box | null };

export type BaseLayout = {
  countries: Placed<CountryLabelItem>[];
  cities: Placed<CityItem>[];
  landmarks: PlacedLandmark[];
};

export const LANDMARK_RADIUS = 11;
export const LANDMARK_FONT = 12;
const MAX_LANDMARKS = 40;
const LANDMARK_LABEL_MAX = 24;

// Only the most famous sights show on a world view; each zoom step lets less famous ones in.
const minLinksFor = (k: number) => 160 / Math.pow(k, 0.55);

const landmarkLabel = (name: string) =>
  name.length > LANDMARK_LABEL_MAX ? `${name.slice(0, LANDMARK_LABEL_MAX - 1).trimEnd()}…` : name;

const LABEL_SIDES: RouteLabelSide[] = ["right", "left", "top", "bottom"];

const landmarkLabelBox = (sx: number, sy: number, width: number, side: RouteLabelSide): Box => {
  if (side === "right") return [sx + LANDMARK_RADIUS + 2, sy - 9, sx + LANDMARK_RADIUS + 6 + width, sy + 9];
  if (side === "left") return [sx - LANDMARK_RADIUS - 6 - width, sy - 9, sx - LANDMARK_RADIUS - 2, sy + 9];
  const y = side === "top" ? sy - LANDMARK_RADIUS - 10 : sy + LANDMARK_RADIUS + 10;
  return [sx - width / 2 - 2, y - 9, sx + width / 2 + 2, y + 9];
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

export const computeBaseLayout = (
  viewport: Viewport,
  cities: CityIndex | null,
  projected: ProjectedCities | null,
  minPopulation: number,
  landmarks: ProjectedLandmark[] | null = null,
): BaseLayout => {
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
      if (city.population < minPopulation) continue;
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

  // Famous sights go first: they are what people look for on a city's map. A label takes a side that leaves the
  // icons of the sights still to come uncovered or, failing that, covers the least famous of them.
  const placedLandmarks: PlacedLandmark[] = [];
  const minLinks = minLinksFor(k);
  const candidates: { landmark: Landmark; ux: number; uy: number; sx: number; sy: number; box: Box }[] = [];
  for (const { landmark, ux, uy } of landmarks ?? []) {
    if (landmark.links < minLinks || candidates.length >= MAX_LANDMARKS * 2) break;
    if (!(ux >= minX && ux <= maxX && uy >= minY && uy <= maxY)) continue;
    const [sx, sy] = toScreen(viewport, ux, uy);
    candidates.push({ landmark, ux, uy, sx, sy, box: [sx - LANDMARK_RADIUS, sy - LANDMARK_RADIUS, sx + LANDMARK_RADIUS, sy + LANDMARK_RADIUS] });
  }
  candidates.forEach(({ landmark, ux, uy, sx, sy, box }, i) => {
    if (placedLandmarks.length >= MAX_LANDMARKS || !tryAdd(box)) return;
    const label = landmarkLabel(landmark.name);
    const width = label.length * LANDMARK_FONT * 0.56;
    const free = (b: Box) => !boxes.some((o) => intersects(o, b));
    // Cost of a side: the fame of the most famous sight still to come that it would cover (0 if none).
    const cost = (b: Box) => Math.max(0, ...candidates.slice(i + 1).filter((c) => intersects(c.box, b)).map((c) => c.landmark.links));
    const sides = LABEL_SIDES.map((side) => ({ side, box: landmarkLabelBox(sx, sy, width, side) }))
      .filter((s) => free(s.box))
      .map((s) => ({ ...s, cost: cost(s.box) }));
    const pick = sides.reduce<(typeof sides)[number] | undefined>((best, s) => (!best || s.cost < best.cost ? s : best), undefined);
    if (pick) boxes.push(pick.box);
    placedLandmarks.push({ item: { landmark, ux, uy, label, side: pick?.side ?? null }, box, labelBox: pick?.box ?? null });
  });

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

  return { countries: placedCountries, cities: placedCities, landmarks: placedLandmarks };
};

export const ROUTE_RADIUS = 13;
export const ROUTE_FONT = 13;
const CLUSTER_PX = 26;
const ROUTE_LABEL_MAX = 26;
const ROUTE_LABEL_GAP = 6;
const ROUTE_SIDES: RouteLabelSide[] = ["right", "left", "top", "bottom"];

const routeTextWidth = (text: string) => text.length * ROUTE_FONT * 0.58;

const shorten = (name: string) => (name.length > ROUTE_LABEL_MAX ? `${name.slice(0, ROUTE_LABEL_MAX - 1).trimEnd()}…` : name);

// "6" for one stop, "6–7" for neighbours, "3, 6" otherwise.
const numberText = (numbers: number[]) =>
  numbers.length === 1
    ? String(numbers[0])
    : numbers.every((n, i) => i === 0 || n === numbers[i - 1] + 1)
      ? `${numbers[0]}–${numbers[numbers.length - 1]}`
      : numbers.join(", ");

const routeLabelBox = (sx: number, sy: number, half: number, width: number, side: RouteLabelSide): Box => {
  const h = ROUTE_FONT / 2 + 3;
  const above = sy - ROUTE_RADIUS - ROUTE_LABEL_GAP;
  const below = sy + ROUTE_RADIUS + ROUTE_LABEL_GAP;
  if (side === "right") return [sx + half + ROUTE_LABEL_GAP - 2, sy - h, sx + half + ROUTE_LABEL_GAP + width + 2, sy + h];
  if (side === "left") return [sx - half - ROUTE_LABEL_GAP - width - 2, sy - h, sx - half - ROUTE_LABEL_GAP + 2, sy + h];
  if (side === "top") return [sx - width / 2 - 2, above - 2 * h, sx + width / 2 + 2, above];
  return [sx - width / 2 - 2, below, sx + width / 2 + 2, below + 2 * h];
};

// Stops that would overlap on screen merge into one marker; each label then takes the first free side, or is left out.
export const layoutRoute = (viewport: Viewport, stops: TripStop[]): { items: RouteItem[]; boxes: Box[] } => {
  type Cluster = { stops: TripStop[]; numbers: number[]; ux: number; uy: number; sx: number; sy: number };
  const clusters: Cluster[] = [];
  stops.forEach((stop, i) => {
    const p = projection([stop.lng, stop.lat]);
    if (!p) return;
    const [sx, sy] = toScreen(viewport, p[0], p[1]);
    const near = clusters.find((c) => Math.hypot(c.sx - sx, c.sy - sy) < CLUSTER_PX);
    if (near) {
      near.stops.push(stop);
      near.numbers.push(i + 1);
    } else clusters.push({ stops: [stop], numbers: [i + 1], ux: p[0], uy: p[1], sx, sy });
  });

  const items: RouteItem[] = clusters.map((c) => {
    const text = numberText(c.numbers);
    return {
      key: c.stops[0].id,
      ux: c.ux,
      uy: c.uy,
      text,
      width: Math.max(ROUTE_RADIUS * 2, text.length * 8 + 14),
      label: null,
      side: "right",
      title: c.stops.map((s, i) => `${c.numbers[i]}. ${s.name}`).join("\n"),
      site: c.stops.every((s) => Boolean(s.siteId)),
    };
  });
  const boxes: Box[] = clusters.map((c, i) => [c.sx - items[i].width / 2, c.sy - ROUTE_RADIUS, c.sx + items[i].width / 2, c.sy + ROUTE_RADIUS]);

  clusters.forEach((c, i) => {
    const label = shorten(c.stops[0].name) + (c.stops.length > 1 ? ` +${c.stops.length - 1}` : "");
    const width = routeTextWidth(label);
    for (const side of ROUTE_SIDES) {
      const box = routeLabelBox(c.sx, c.sy, items[i].width / 2, width, side);
      if (boxes.some((b) => intersects(b, box))) continue;
      boxes.push(box);
      items[i].label = label;
      items[i].side = side;
      break;
    }
  });

  return { items, boxes };
};

export const applyPins = (viewport: Viewport, base: BaseLayout, placePoints: PlacePoint[], routeBoxes: Box[] = []): LabelLayout => {
  const placedCityIds = new Set(placePoints.flatMap((p) => (p.place.cityId !== undefined ? [p.place.cityId] : [])));
  // The open trip's route goes first: pins and labels in its way give way.
  const pinBoxes: Box[] = [...routeBoxes];
  const pins: PinItem[] = [];
  const underRoute = (sx: number, sy: number) => routeBoxes.some((b) => sx > b[0] && sx < b[2] && sy > b[1] && sy < b[3]);

  for (const { place, x, y } of placePoints) {
    if (Number.isNaN(x)) continue;
    const [sx, sy] = toScreen(viewport, x, y);
    if (sx < -EDGE || sy < -EDGE || sx > viewport.width + EDGE || sy > viewport.height + EDGE) continue;
    if (underRoute(sx, sy)) continue;
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
    landmarkItems: base.landmarks
      .filter((l) => free(l.box))
      .map((l) => (l.labelBox && !free(l.labelBox) ? { ...l.item, side: null } : l.item)),
  };
};
