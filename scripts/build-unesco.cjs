// Builds public/data/unesco.json from the UNESCO World Heritage List (CC BY-SA 4.0).
// Source: https://data.unesco.org/explore/dataset/whc001/
// Usage: curl -o whc.json https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/exports/json
//        node scripts/build-unesco.cjs whc.json public/data/unesco.json
// Row format: [id, name, "CC,CC", lat, lng, yearInscribed, "C"|"N"|"M", inDanger 0|1]
const fs = require("fs");
const [src, out] = process.argv.slice(2);
const cat = { Cultural: "C", Natural: "N", Mixed: "M" };
const all = JSON.parse(fs.readFileSync(src, "utf8"));
const rows = all
  .filter((r) => !r.date_end && r.geo_point_2d && r.iso_codes?.length)
  .map((r) => [
    Number(r.id_no),
    r.name_en.trim(),
    r.iso_codes.join(","),
    Math.round(r.geo_point_2d.lat * 1000) / 1000,
    Math.round(r.geo_point_2d.lon * 1000) / 1000,
    Number(r.date_inscribed),
    cat[r.category],
    r.danger === "True" ? 1 : 0,
  ])
  .sort((a, b) => a[0] - b[0]);
fs.writeFileSync(out, JSON.stringify(rows));
console.log(`${rows.length} sites, skipped ${all.length - rows.length}`);
