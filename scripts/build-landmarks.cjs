// Builds public/data/landmarks.json: well-known sights from Wikidata (CC0), ranked by how many Wikipedias cover them.
// Usage: node scripts/build-landmarks.cjs public/data/landmarks.json [cached-raw.json]
// Without a cached file it queries the Wikidata SPARQL endpoint one class at a time (a few minutes) and saves raw.json next to the output.
// Row format: [qid, name, countryCode, lat, lng, sitelinks, category]
const fs = require("fs");
const path = require("path");

const [out, cachedRaw] = process.argv.slice(2);

// Wikidata class → icon category. Items match the class directly or through one subclass.
const CLASSES = {
  Q12518: "tower", Q1440300: "tower", Q11303: "skyscraper",
  Q23413: "castle", Q57821: "castle", Q1785071: "castle",
  Q16560: "palace",
  Q2977: "church", Q16970: "church", Q163687: "church", Q160742: "church", Q44613: "church",
  Q32815: "mosque",
  Q44539: "temple", Q5393308: "temple", Q842402: "temple", Q199451: "temple",
  Q33506: "museum", Q207694: "museum", Q2087181: "museum",
  Q12280: "bridge",
  Q4989906: "monument", Q179700: "monument", Q5003624: "monument", Q170980: "monument", Q53060: "monument", Q82117: "monument", Q143912: "monument",
  Q109607: "ruins", Q839954: "ruins", Q54831: "ruins", Q12516: "ruins", Q162875: "ruins",
  Q483110: "stadium",
  Q153562: "theatre", Q24354: "theatre",
  Q39715: "lighthouse",
  Q570116: "attraction",
  Q8502: "nature", Q34038: "nature", Q8072: "nature", Q150784: "nature",
};

// An item in several classes gets the first matching category: the Statue of Liberty is a monument, not a tower.
const PRIORITY = ["monument", "church", "mosque", "temple", "castle", "palace", "ruins", "tower", "skyscraper", "bridge", "theatre", "lighthouse", "museum", "stadium", "nature", "attraction"];

// Hand fixes where the priority picks the less familiar role.
const OVERRIDES = { Q19675: "museum" /* Louvre */ };

// Items whose sitelinks reflect Wikipedia's own interest rather than visitors'.
const EXCLUDE = new Set(["Q18201640" /* Wikipedia Monument, Słubice */]);

// Minimum number of Wikipedia language editions; busy categories need more to keep the map readable.
const FETCH_MIN = 15;
const MIN_LINKS = { default: 25, stadium: 80, nature: 40, skyscraper: 35, ruins: 30 };

const query = (qid) => `
SELECT ?item ?links ?coord ?pl ?en ?cc WHERE {
  ?item wdt:P31/wdt:P279? wd:${qid} ; wikibase:sitelinks ?links ; wdt:P625 ?coord .
  FILTER(?links >= ${FETCH_MIN})
  OPTIONAL { ?item rdfs:label ?pl FILTER(lang(?pl) = "pl") }
  OPTIONAL { ?item rdfs:label ?en FILTER(lang(?en) = "en") }
  OPTIONAL { ?item wdt:P17 ?c . ?c wdt:P297 ?cc }
}`;

// Historical countries in Wikidata mapped to today's codes used by the map.
const LEGACY_COUNTRIES = { DD: "DE", SU: "RU", YU: "RS", CS: "CZ", XK: "XK" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The public endpoint rate-limits; on 429 it says how long to wait.
const sparql = async (q) => {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://query.wikidata.org/sparql", {
      method: "POST",
      headers: { Accept: "application/sparql-results+json", "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "visited-map-build/0.1" },
      body: new URLSearchParams({ query: q }),
    });
    if (res.ok) return (await res.json()).results.bindings;
    if ((res.status !== 429 && res.status < 500) || attempt === 6) throw new Error(`SPARQL HTTP ${res.status}`);
    const wait = Number(res.headers.get("retry-after")) * 1000 || 10_000 * attempt;
    console.log(`HTTP ${res.status}, retrying in ${Math.round(wait / 1000)}s`);
    await sleep(wait);
  }
};

// Cities and spa towns sometimes carry a sight class too (Cairo as an archaeological site); anything that is a
// human settlement is dropped.
const fetchSettlements = async (qids) => {
  const found = new Set();
  for (let i = 0; i < qids.length; i += 200) {
    const values = qids.slice(i, i + 200).map((q) => `wd:${q}`).join(" ");
    const rows = await sparql(`SELECT DISTINCT ?item WHERE { VALUES ?item { ${values} } ?item wdt:P31/wdt:P279* wd:Q486972 . }`);
    for (const r of rows) found.add(r.item.value.split("/").pop());
    console.log(`settlement check ${Math.min(i + 200, qids.length)}/${qids.length}: ${found.size} found`);
    await sleep(2000);
  }
  return found;
};

const fetchRaw = async () => {
  const rows = [];
  for (const [qid, category] of Object.entries(CLASSES)) {
    const res = await fetch("https://query.wikidata.org/sparql?" + new URLSearchParams({ query: query(qid) }), {
      headers: { Accept: "application/sparql-results+json", "User-Agent": "visited-map-build/0.1" },
    });
    if (!res.ok) throw new Error(`${qid}: HTTP ${res.status}`);
    for (const r of (await res.json()).results.bindings) {
      rows.push({ qid: r.item.value.split("/").pop(), category, links: +r.links.value, coord: r.coord.value, pl: r.pl?.value, en: r.en?.value, cc: r.cc?.value });
    }
    console.log(qid, category, rows.length);
    await new Promise((r) => setTimeout(r, 400));
  }
  return rows;
};

(async () => {
  const raw = cachedRaw ? JSON.parse(fs.readFileSync(cachedRaw, "utf8")) : await fetchRaw();
  if (!cachedRaw) fs.writeFileSync(path.join(path.dirname(out), "landmarks.raw.json"), JSON.stringify(raw));

  const items = new Map();
  for (const r of raw) {
    const item = items.get(r.qid) ?? { ...r, categories: new Set(), countries: new Set() };
    item.categories.add(r.category);
    if (r.cc) item.countries.add(r.cc);
    items.set(r.qid, item);
  }

  const rows = [];
  for (const item of items.values()) {
    const category = OVERRIDES[item.qid] ?? PRIORITY.find((c) => item.categories.has(c));
    const name = (item.pl ?? item.en ?? "").trim();
    const point = /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(item.coord);
    if (EXCLUDE.has(item.qid) || !category || !name || /^Q\d+$/.test(name) || !point || item.countries.size === 0) continue;
    if (item.links < (MIN_LINKS[category] ?? MIN_LINKS.default)) continue;
    const round = (v) => Math.round(Number(v) * 10000) / 10000;
    rows.push([item.qid, name, [...item.countries].sort()[0], round(point[2]), round(point[1]), item.links, category]);
  }
  const settlementsFile = path.join(path.dirname(cachedRaw ?? out), "landmarks.settlements.json");
  const settlements = fs.existsSync(settlementsFile)
    ? new Set(JSON.parse(fs.readFileSync(settlementsFile, "utf8")))
    : await fetchSettlements(rows.map((r) => r[0]));
  fs.writeFileSync(settlementsFile, JSON.stringify([...settlements]));

  const kept = rows
    .filter((r) => !settlements.has(r[0]))
    .map((r) => [r[0], r[1], LEGACY_COUNTRIES[r[2]] ?? r[2], ...r.slice(3)])
    .sort((a, b) => b[5] - a[5]);
  console.log(`dropped ${rows.length - kept.length} settlements`);
  rows.length = 0;
  rows.push(...kept);
  fs.writeFileSync(out, JSON.stringify(rows));

  const perCategory = {};
  for (const r of rows) perCategory[r[6]] = (perCategory[r[6]] ?? 0) + 1;
  console.log(`${rows.length} landmarks, ${fs.statSync(out).size} bytes`, perCategory);
})();
