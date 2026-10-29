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
const WIKI_SKIP_TYPES = new Set(["city", "country", "adm1st", "adm2nd", "adm3rd", "region", "isle", "railwaystation", "airport"]);

export class NearbyError extends Error {}

export const distanceM = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const r = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return Math.round(12_742_000 * Math.asin(Math.sqrt(a)));
};

const cache = new Map<string, Promise<unknown>>();

const cached = <T,>(key: string, load: () => Promise<T>): Promise<T> => {
  const hit = cache.get(key);
  if (hit) return hit as Promise<T>;
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

type WikiHit = { pageid: number; title: string; lat: number; lon: number; type?: string | null };

type WikiPage = { pageid: number; extract?: string; thumbnail?: { source: string }; fullurl?: string };

const WIKI_API = "https://pl.wikipedia.org/w/api.php";
// Wikipedia returns intro extracts for at most 20 pages per request, so details load in pages of that size.
export const WIKI_PAGE = 20;

const wikiGet = async <T,>(params: Record<string, string>) => {
  const res = await fetch(`${WIKI_API}?${new URLSearchParams({ ...params, format: "json", origin: "*" })}`, {
    signal: AbortSignal.timeout(WIKI_TIMEOUT),
  });
  if (!res.ok) throw new NearbyError("Wikipedia nie odpowiada. Spróbuj za chwilę.");
  return (await res.json()) as T;
};

// Every geotagged article around the point, nearest first; regions, cities and stations are left out.
const fetchWikiIndex = (lat: number, lng: number, radius: number) =>
  cached(`wiki-index:${lat.toFixed(4)},${lng.toFixed(4)}:${radius}`, async () => {
    const data = await wikiGet<{ query?: { geosearch: WikiHit[] } }>({
      action: "query",
      list: "geosearch",
      gscoord: `${lat}|${lng}`,
      gsradius: String(Math.min(radius, 10000)),
      gslimit: "500",
      gsprop: "type",
    });
    return (data.query?.geosearch ?? []).filter((h) => h.type && !WIKI_SKIP_TYPES.has(h.type));
  });

const fetchWikiDetails = (hits: WikiHit[]) =>
  cached(`wiki-details:${hits.map((h) => h.pageid).join(",")}`, async () => {
    const data = await wikiGet<{ query?: { pages: Record<string, WikiPage> } }>({
      action: "query",
      pageids: hits.map((h) => h.pageid).join("|"),
      prop: "extracts|pageimages|info",
      inprop: "url",
      exintro: "1",
      explaintext: "1",
      exsentences: "2",
      exlimit: String(WIKI_PAGE),
      pilimit: String(WIKI_PAGE),
      pithumbsize: "160",
    });
    return data.query?.pages ?? {};
  });

const fetchSights = async (lat: number, lng: number, radius: number, count: number) => {
  const index = await fetchWikiIndex(lat, lng, radius);
  const shown = index.slice(0, count);
  const chunks = Array.from({ length: Math.ceil(shown.length / WIKI_PAGE) }, (_, i) => shown.slice(i * WIKI_PAGE, (i + 1) * WIKI_PAGE));
  const details = Object.assign({}, ...(await Promise.all(chunks.map(fetchWikiDetails)))) as Record<string, WikiPage>;
  const places = shown.map(
    (h): NearbyPlace => ({
      id: `wiki-${h.pageid}`,
      name: h.title,
      category: "see",
      kind: "z Wikipedii",
      lat: h.lat,
      lng: h.lon,
      distance: distanceM(lat, lng, h.lat, h.lon),
      description: details[h.pageid]?.extract,
      image: details[h.pageid]?.thumbnail?.source,
      wikiUrl: details[h.pageid]?.fullurl,
    }),
  );
  return { places, hasMore: index.length > count };
};

export type NearbyResult = { places: NearbyPlace[]; error: string | null; loading: boolean; hasMore: boolean };

const messageOf = (e: unknown) => (e instanceof NearbyError ? e.message : "Nie udało się pobrać miejsc.");

// Sights come from Wikipedia only for now: the public OpenStreetMap servers proved too unreliable.
// const sameName = (a: string, b: string) => a.localeCompare(b, "pl", { sensitivity: "base" }) === 0;
// const merge = (wiki: NearbyPlace[], osm: NearbyPlace[]) =>
//   [...wiki, ...osm.filter((o) => !wiki.some((w) => sameName(w.name, o.name)))].sort((a, b) => a.distance - b.distance);

// `count` is how many sights to show; it grows with "Pokaż więcej".
export const fetchNearby = async (
  category: NearbyCategory,
  lat: number,
  lng: number,
  radius: number,
  count: number,
  onUpdate: (result: NearbyResult) => void,
) => {
  try {
    if (category === "see") {
      onUpdate({ ...(await fetchSights(lat, lng, radius, count)), error: null, loading: false });
    } else {
      onUpdate({ places: await fetchOsm(category, lat, lng, radius), error: null, loading: false, hasMore: false });
    }
  } catch (e) {
    onUpdate({ places: [], error: messageOf(e), loading: false, hasMore: false });
  }
};

export const formatDistance = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} km`);

export const googleMapsUrl = (name: string, near: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${near}`)}`;
