export type NearbyCategory = "sleep" | "eat" | "see";

export type NearbyRange = "near" | "mid" | "far";

export type NearbyPlace = {
  id: string;
  name: string;
  category: NearbyCategory;
  kind: string;
  lat: number;
  lng: number;
  distance: number;
  website?: string;
  openingHours?: string;
  description?: string;
  image?: string;
  wikiUrl?: string;
};

export const CATEGORY_LABEL: Record<NearbyCategory, string> = { sleep: "🛏 Noclegi", eat: "🍽 Jedzenie", see: "★ Warte zobaczenia" };

export const RANGE_LABEL: Record<NearbyRange, string> = { near: "Blisko", mid: "Średnio", far: "Daleko" };

// Metres per category: food is worth walking to, sights and beds are worth a short ride.
export const RADIUS: Record<NearbyRange, Record<NearbyCategory, number>> = {
  near: { eat: 500, sleep: 1000, see: 2000 },
  mid: { eat: 1500, sleep: 3000, see: 5000 },
  far: { eat: 3000, sleep: 8000, see: 10000 },
};

const OSM_KINDS: Record<NearbyCategory, { key: string; values: Record<string, string> }[]> = {
  sleep: [{ key: "tourism", values: { hotel: "hotel", hostel: "hostel", guest_house: "pensjonat", motel: "motel", apartment: "apartament" } }],
  eat: [{ key: "amenity", values: { restaurant: "restauracja", cafe: "kawiarnia", fast_food: "fast food", bar: "bar", pub: "pub" } }],
  see: [
    { key: "tourism", values: { attraction: "atrakcja", museum: "muzeum", viewpoint: "punkt widokowy", gallery: "galeria", zoo: "zoo" } },
    { key: "historic", values: { castle: "zamek", monument: "pomnik", ruins: "ruiny", archaeological_site: "stanowisko archeologiczne" } },
  ],
};

// Public Overpass servers are often slow or busy, so two are asked at once and the first answer wins.
const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const OVERPASS_TIMEOUT = 20_000;
const WIKI_TIMEOUT = 10_000;
const MAX_PER_CATEGORY = 40;
const WIKI_SKIP_TYPES = new Set(["city", "country", "adm1st", "adm2nd", "adm3rd", "region", "isle"]);

export class NearbyError extends Error {}

export const distanceM = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const r = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return Math.round(12_742_000 * Math.asin(Math.sqrt(a)));
};

const cache = new Map<string, Promise<NearbyPlace[]>>();

const cached = (key: string, load: () => Promise<NearbyPlace[]>) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = load().catch((e) => {
    cache.delete(key);
    throw e;
  });
  cache.set(key, promise);
  return promise;
};

type OsmElement = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

const overpass = async (query: string) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT);
  const ask = async (url: string) => {
    const res = await fetch(url, { method: "POST", body: new URLSearchParams({ data: query }), signal: controller.signal });
    if (!res.ok) throw new Error(String(res.status));
    return ((await res.json()) as { elements: OsmElement[] }).elements;
  };
  try {
    return await Promise.any(OVERPASS.map(ask));
  } catch {
    throw new NearbyError("Serwery OpenStreetMap są teraz przeciążone. Spróbuj za chwilę.");
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
};

const fetchOsm = (category: NearbyCategory, lat: number, lng: number, radius: number) =>
  cached(`osm:${category}:${lat.toFixed(4)},${lng.toFixed(4)}:${radius}`, async () => {
    const groups = OSM_KINDS[category];
    const filters = groups
      .map((g) => `nwr["name"]["${g.key}"~"^(${Object.keys(g.values).join("|")})$"](around:${radius},${lat},${lng});`)
      .join("");
    const elements = await overpass(`[out:json][timeout:12];(${filters});out center tags 150;`);
    return elements
      .flatMap((e): NearbyPlace[] => {
        const tags = e.tags ?? {};
        const pLat = e.lat ?? e.center?.lat;
        const pLng = e.lon ?? e.center?.lon;
        const group = groups.find((g) => tags[g.key] in g.values);
        if (!tags.name || pLat === undefined || pLng === undefined || !group) return [];
        return [
          {
            id: `osm-${e.type}-${e.id}`,
            name: tags["name:pl"] ?? tags.name,
            category,
            kind: group.values[tags[group.key]],
            lat: pLat,
            lng: pLng,
            distance: distanceM(lat, lng, pLat, pLng),
            website: tags.website ?? tags["contact:website"],
            openingHours: tags.opening_hours,
          },
        ];
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_PER_CATEGORY);
  });

type WikiPage = {
  pageid: number;
  title: string;
  extract?: string;
  thumbnail?: { source: string };
  coordinates?: { lat: number; lon: number; type?: string }[];
};

const fetchWiki = (lat: number, lng: number, radius: number) =>
  cached(`wiki:${lat.toFixed(4)},${lng.toFixed(4)}:${radius}`, async () => {
    const params = new URLSearchParams({
      action: "query",
      generator: "geosearch",
      ggscoord: `${lat}|${lng}`,
      ggsradius: String(Math.min(radius, 10000)),
      ggslimit: "20",
      prop: "extracts|pageimages|coordinates|info",
      inprop: "url",
      exintro: "1",
      explaintext: "1",
      exsentences: "2",
      exlimit: "max",
      pilimit: "max",
      colimit: "max",
      coprop: "type",
      pithumbsize: "160",
      format: "json",
      origin: "*",
    });
    const res = await fetch(`https://pl.wikipedia.org/w/api.php?${params}`, { signal: AbortSignal.timeout(WIKI_TIMEOUT) });
    if (!res.ok) throw new NearbyError("Wikipedia nie odpowiada. Spróbuj za chwilę.");
    const pages = Object.values(((await res.json()) as { query?: { pages: Record<string, WikiPage & { fullurl?: string }> } }).query?.pages ?? {});
    return pages.flatMap((p): NearbyPlace[] => {
      const c = p.coordinates?.[0];
      if (!c?.type || WIKI_SKIP_TYPES.has(c.type)) return [];
      return [
        {
          id: `wiki-${p.pageid}`,
          name: p.title,
          category: "see",
          kind: "z Wikipedii",
          lat: c.lat,
          lng: c.lon,
          distance: distanceM(lat, lng, c.lat, c.lon),
          description: p.extract,
          image: p.thumbnail?.source,
          wikiUrl: p.fullurl,
        },
      ];
    });
  });

const sameName = (a: string, b: string) => a.localeCompare(b, "pl", { sensitivity: "base" }) === 0;

export type NearbyResult = { places: NearbyPlace[]; error: string | null; loading: boolean };

const messageOf = (e: unknown) => (e instanceof NearbyError ? e.message : "Nie udało się pobrać miejsc.");

const merge = (wiki: NearbyPlace[], osm: NearbyPlace[]) =>
  [...wiki, ...osm.filter((o) => !wiki.some((w) => sameName(w.name, o.name)))].sort((a, b) => a.distance - b.distance);

// Reports progress through onUpdate: sights show Wikipedia's fast answer first and add OpenStreetMap's when it arrives.
export const fetchNearby = async (
  category: NearbyCategory,
  lat: number,
  lng: number,
  radius: number,
  onUpdate: (result: NearbyResult) => void,
) => {
  if (category !== "see") {
    try {
      onUpdate({ places: await fetchOsm(category, lat, lng, radius), error: null, loading: false });
    } catch (e) {
      onUpdate({ places: [], error: messageOf(e), loading: false });
    }
    return;
  }
  let wiki: NearbyPlace[] = [];
  let osm: NearbyPlace[] = [];
  let failures = 0;
  let lastError: unknown = null;
  let pending = 2;
  const settle = () => {
    pending--;
    const places = merge(wiki, osm);
    onUpdate({ places, error: pending === 0 && failures === 2 ? messageOf(lastError) : null, loading: pending > 0 });
  };
  const track = (load: Promise<NearbyPlace[]>, store: (p: NearbyPlace[]) => void) =>
    load.then(store, (e) => {
      failures++;
      lastError = e;
    }).then(settle);
  await Promise.all([
    track(fetchWiki(lat, lng, radius), (p) => (wiki = p)),
    track(fetchOsm("see", lat, lng, radius), (p) => (osm = p)),
  ]);
};

export const formatDistance = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} km`);

export const googleMapsUrl = (name: string, near: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${near}`)}`;
