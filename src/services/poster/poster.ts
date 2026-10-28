import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { shapes } from "../../data/countries";
import type { CountryEntry, Place } from "../../store/store.types";
import { theme } from "../../theme/theme";
import { formatDate } from "../../utils/dates";
import { plural } from "../../utils/text";

export type PosterFormat = "post" | "story";

export const POSTER_SIZE: Record<PosterFormat, { width: number; height: number }> = {
  post: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export type PosterInput = {
  countries: Record<string, CountryEntry>;
  places: Place[];
  visited: number;
  total: number;
  percent: number;
  continentsVisited: number;
  cities: number;
  unescoVisited: number;
  continents: { name: string; done: number; total: number }[];
};

type Ctx = CanvasRenderingContext2D;
type Rect = { x: number; y: number; w: number; h: number };

const C = theme.colors;
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "Outfit, system-ui, sans-serif";
const FRAME = 40;
const MARGIN = 96;
const MAP_ASPECT = 1.95;

const percentPl = (value: number) => value.toLocaleString("pl-PL");

const mapShapes = shapes.filter((s) => s.code !== "AQ");
const mapCollection: FeatureCollection<Geometry> = { type: "FeatureCollection", features: mapShapes.map((s) => s.feature) };

export const loadPosterFonts = () =>
  Promise.all([`88px ${SERIF}`, `800 64px ${SANS}`, `600 26px ${SANS}`, `500 24px ${SANS}`].map((f) => document.fonts.load(f)));

const roundRect = (ctx: Ctx, r: Rect, radius: number) => {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
};

const text = (ctx: Ctx, value: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") => {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(value, x, y);
};

// Card with the app's flat offset shadow.
const panel = (ctx: Ctx, r: Rect, fill: string, radius = 18) => {
  ctx.fillStyle = C.ink;
  roundRect(ctx, { ...r, x: r.x + 6, y: r.y + 6 }, radius);
  ctx.fill();
  ctx.fillStyle = fill;
  roundRect(ctx, r, radius);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
};

const drawBackground = (ctx: Ctx, width: number, height: number) => {
  ctx.fillStyle = C.frame;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = C.card;
  roundRect(ctx, { x: FRAME, y: FRAME, w: width - FRAME * 2, h: height - FRAME * 2 }, 36);
  ctx.fill();
};

const drawLogo = (ctx: Ctx, y: number, size: number) => {
  text(ctx, "TWOJA WŁASNA", MARGIN, y, `600 ${Math.round(size * 0.3)}px ${SANS}`, C.inkSoft);
  const titleY = y + size * 1.02;
  const title = "mapa podróży";
  text(ctx, title, MARGIN, titleY, `${size}px ${SERIF}`, C.ink);
  const w = ctx.measureText(title).width;
  ctx.fillStyle = C.red;
  ctx.beginPath();
  ctx.arc(MARGIN + w + size * 0.16, titleY - size * 0.09, size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  return titleY;
};

const drawMap = (ctx: Ctx, r: Rect, input: PosterInput) => {
  panel(ctx, r, C.ocean, 24);
  ctx.save();
  roundRect(ctx, r, 24);
  ctx.clip();

  const projection = geoNaturalEarth1().fitExtent(
    [
      [r.x + 18, r.y + 18],
      [r.x + r.w - 18, r.y + r.h - 18],
    ],
    mapCollection,
  );
  const path = geoPath(projection, ctx);

  for (const shape of mapShapes) {
    const entry = shape.code ? input.countries[shape.code] : undefined;
    ctx.beginPath();
    path(shape.feature);
    ctx.fillStyle = entry?.status === "visited" ? entry.color : C.land;
    ctx.fill();
    if (entry?.status === "wish") {
      ctx.fillStyle = C.wishFill;
      ctx.fill();
    }
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = C.border;
    ctx.stroke();
  }

  // Dashed outline drawn last so neighbours don't paint over it.
  ctx.setLineDash([5, 3]);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = C.wish;
  for (const shape of mapShapes) {
    if (!shape.code || input.countries[shape.code]?.status !== "wish") continue;
    ctx.beginPath();
    path(shape.feature);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (const place of input.places) {
    const p = projection([place.lng, place.lat]);
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2);
    ctx.fillStyle = place.status === "visited" ? C.red : C.paper;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = place.status === "visited" ? C.paper : C.red;
    ctx.stroke();
  }
  ctx.restore();
};

type Tile = { value: string; label: string };

const drawTile = (ctx: Ctx, r: Rect, tile: Tile, highlight: boolean, valueSize: number) => {
  panel(ctx, r, highlight ? C.mustard : C.paper);
  const pad = 24;
  text(ctx, tile.value, r.x + pad, r.y + pad + valueSize * 0.78, `800 ${valueSize}px ${SANS}`, C.ink);
  text(ctx, tile.label, r.x + pad, r.y + r.h - pad, `500 ${Math.round(valueSize * 0.36)}px ${SANS}`, C.ink);
};

const tiles = (input: PosterInput): Tile[] => [
  { value: String(input.visited), label: `${plural(input.visited, "kraj", "kraje", "krajów")} · ${percentPl(input.percent)}%` },
  { value: String(input.continentsVisited), label: plural(input.continentsVisited, "kontynent", "kontynenty", "kontynentów") },
  { value: String(input.cities), label: plural(input.cities, "miasto", "miasta", "miast") },
  { value: String(input.unescoVisited), label: `${plural(input.unescoVisited, "miejsce", "miejsca", "miejsc")} UNESCO` },
];

const drawFooter = (ctx: Ctx, height: number, date: Date) => {
  const y = height - FRAME - 44;
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  text(ctx, `stan na ${formatDate(iso)}`, MARGIN, y, `500 24px ${SANS}`, C.inkSoft);
};

const drawPost = (ctx: Ctx, input: PosterInput) => {
  const { width, height } = POSTER_SIZE.post;
  const inner = width - MARGIN * 2;
  const logoBottom = drawLogo(ctx, 112, 72);
  const mapRect = { x: MARGIN, y: logoBottom + 44, w: inner, h: Math.round(inner / MAP_ASPECT) };
  drawMap(ctx, mapRect, input);
  const gap = 18;
  const tileW = (inner - gap * 3) / 4;
  tiles(input).forEach((tile, i) =>
    drawTile(ctx, { x: MARGIN + i * (tileW + gap), y: mapRect.y + mapRect.h + 44, w: tileW, h: 170 }, tile, i === 0, 62),
  );
  drawFooter(ctx, height, new Date());
};

const drawStory = (ctx: Ctx, input: PosterInput) => {
  const { width, height } = POSTER_SIZE.story;
  const inner = width - MARGIN * 2;
  const logoBottom = drawLogo(ctx, 150, 96);

  const numberY = logoBottom + 250;
  const number = String(input.visited);
  text(ctx, number, MARGIN - 8, numberY, `250px ${SERIF}`, C.red);
  const numberW = ctx.measureText(number).width;
  text(ctx, plural(input.visited, "kraj", "kraje", "krajów"), MARGIN + numberW + 28, numberY - 120, `800 56px ${SANS}`, C.ink);
  text(ctx, `${percentPl(input.percent)}% świata`, MARGIN + numberW + 28, numberY - 56, `500 40px ${SANS}`, C.inkSoft);

  const mapRect = { x: MARGIN, y: numberY + 60, w: inner, h: Math.round(inner / MAP_ASPECT) };
  drawMap(ctx, mapRect, input);

  const gap = 18;
  const tileW = (inner - gap) / 2;
  const tileH = 150;
  const tilesY = mapRect.y + mapRect.h + 48;
  tiles(input)
    .slice(1)
    .concat({ value: `${input.visited}/${input.total}`, label: "krajów świata" })
    .forEach((tile, i) =>
      drawTile(ctx, { x: MARGIN + (i % 2) * (tileW + gap), y: tilesY + Math.floor(i / 2) * (tileH + gap), w: tileW, h: tileH }, tile, i === 0, 60),
    );

  const barsY = tilesY + 2 * tileH + gap + 70;
  const rowH = 50;
  input.continents.forEach((c, i) => {
    const y = barsY + i * rowH;
    text(ctx, c.name, MARGIN, y, `500 28px ${SANS}`, C.ink);
    text(ctx, `${c.done}/${c.total}`, MARGIN + inner, y, `600 26px ${SANS}`, C.inkSoft, "right");
    const track = { x: MARGIN + 300, y: y - 20, w: inner - 300 - 90, h: 18 };
    ctx.fillStyle = C.paper;
    roundRect(ctx, track, 9);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = C.ink;
    ctx.stroke();
    if (c.done > 0) {
      ctx.fillStyle = C.red;
      roundRect(ctx, { ...track, w: Math.max(18, (track.w * c.done) / c.total) }, 9);
      ctx.fill();
      ctx.stroke();
    }
  });

  drawFooter(ctx, height, new Date());
};

export const drawPoster = (canvas: HTMLCanvasElement, format: PosterFormat, input: PosterInput) => {
  const { width, height } = POSTER_SIZE[format];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  drawBackground(ctx, width, height);
  if (format === "post") drawPost(ctx, input);
  else drawStory(ctx, input);
};

export const posterBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), "image/png"));
