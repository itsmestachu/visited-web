import type { Trip } from "../../store/store.types";
import { clampDays } from "./trips";

// A shared plan travels inside the link's #fragment, which browsers never send to the server.
export const SHARE_PREFIX = "#plan=";

const FORMAT = 1;

type StopRow = [name: string, countryCode: string, lat: number, lng: number, day: number, cityId: number, siteId: string];

type Payload = {
  v: number;
  n: string;
  s?: string;
  e?: string;
  d: number;
  t?: string;
  p: StopRow[];
  c: [text: string, done: 0 | 1][];
};

export type SharedTrip = Omit<Trip, "id" | "createdAt">;

const pipe = async (bytes: Uint8Array, stream: CompressionStream | DecompressionStream) =>
  new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream)).arrayBuffer());

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (text: string) => {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

export const encodeTrip = async (trip: Trip) => {
  const payload: Payload = {
    v: FORMAT,
    n: trip.name,
    s: trip.startDate,
    e: trip.endDate,
    d: trip.days,
    t: trip.note,
    p: trip.stops.map((s) => [s.name, s.countryCode, s.lat, s.lng, s.day, s.cityId ?? 0, s.siteId ?? ""]),
    c: trip.checklist.map((i) => [i.text, i.done ? 1 : 0]),
  };
  const bytes = await pipe(new TextEncoder().encode(JSON.stringify(payload)), new CompressionStream("deflate-raw"));
  return `${location.origin}${location.pathname}${SHARE_PREFIX}${toBase64Url(bytes)}`;
};

const str = (v: unknown, max: number) => (typeof v === "string" && v ? v.slice(0, max) : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

// Links come from other people, so every field is checked rather than trusted.
export const decodeTrip = async (code: string): Promise<SharedTrip | null> => {
  try {
    const bytes = await pipe(fromBase64Url(code), new DecompressionStream("deflate-raw"));
    const p = JSON.parse(new TextDecoder().decode(bytes)) as Partial<Payload>;
    if (p.v !== FORMAT || !Array.isArray(p.p)) return null;
    const days = clampDays(num(p.d) ?? 1);
    const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
    return {
      name: str(p.n, 120) ?? "Wyjazd",
      status: "planned",
      startDate: date(p.s),
      endDate: date(p.e),
      days,
      note: str(p.t, 5000),
      stops: p.p.flatMap((row) => {
        if (!Array.isArray(row)) return [];
        const [name, countryCode, lat, lng, day, cityId, siteId] = row;
        const n = str(name, 200), cc = str(countryCode, 2), la = num(lat), lo = num(lng);
        if (!n || !cc || la === undefined || lo === undefined) return [];
        return [
          {
            id: crypto.randomUUID(),
            name: n,
            countryCode: cc,
            lat: la,
            lng: lo,
            day: Math.min(days, Math.max(1, Math.round(num(day) ?? 1))),
            cityId: num(cityId) || undefined,
            siteId: str(siteId, 20),
          },
        ];
      }),
      checklist: (Array.isArray(p.c) ? p.c : []).flatMap((row) => {
        const text = Array.isArray(row) ? str(row[0], 300) : undefined;
        return text ? [{ id: crypto.randomUUID(), text, done: row[1] === 1 }] : [];
      }),
    };
  } catch {
    return null;
  }
};
