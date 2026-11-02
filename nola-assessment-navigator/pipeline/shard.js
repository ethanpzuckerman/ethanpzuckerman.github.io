// Split the public roll into small JSON files the browser loads on demand (step 2 of 2).
// Each file holds the parcels whose normalized street name starts with the same two characters,
// using the same address.js the app uses, so lookups and data always agree.
const fs = require("fs");
const path = require("path");
const A = require("../address.js");

const ROOT = path.resolve(__dirname, "..");
const IN = path.join(ROOT, "data/processed/roll2026_public.jsonl");
const OUT = path.join(ROOT, "data/web/2026");

const shardKey = name => (name.replace(/[^A-Z0-9]/g, "").slice(0, 2) || "__");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const shards = new Map();
const streets = new Map();
let n = 0, noStreet = 0;
for (const line of fs.readFileSync(IN, "utf8").split("\n")) {
  if (!line) continue;
  const r = JSON.parse(line);
  n++;
  // A parcel with several addresses goes in every shard one of its streets belongs to.
  const keys = new Set();
  for (const addr of String(r.a || "").split(/\s*\|\s*/)) {
    const p = A.parse(addr);
    if (!p.name) { noStreet++; keys.add("__"); continue; }
    keys.add(shardKey(p.name));
    streets.set(p.name, (streets.get(p.name) || 0) + 1);
  }
  for (const k of keys) {
    if (!shards.has(k)) shards.set(k, []);
    shards.get(k).push(r);
  }
}
let bytes = 0;
for (const [k, list] of shards) {
  const s = JSON.stringify(list);
  bytes += s.length;
  fs.writeFileSync(path.join(OUT, `s_${k}.json`), s);
}
const meta = {
  year: 2026,
  source: "Louisiana Tax Commission, Orleans Parish 2026 tax roll (LTC Expanded Real Estate Roll)",
  sourceUrl: "https://stax.latax.la.gov/TaxRollsFolder",
  assessmentDate: "01/01/2023",
  parcels: n,
  generated: new Date().toISOString().slice(0, 10),
  notIncluded: "Owner names, mailing addresses, purchase prices, building size, bedrooms, bathrooms, condition, special taxing districts",
  streets: Object.fromEntries([...streets].sort())
};
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta));
// Parcel ID → file, for lookups by parcel number (and for addresses with no street name).
const ids = {};
for (const [k, list] of shards) for (const r of list) if (!ids[r.id]) ids[r.id] = k;
fs.writeFileSync(path.join(OUT, "ids.json"), JSON.stringify(ids));
console.log(`${n} parcels → ${shards.size} files, ${(bytes / 1e6).toFixed(1)} MB; ${streets.size} street names; ${noStreet} addresses without a street name`);
const big = [...shards].map(([k, v]) => [k, JSON.stringify(v).length]).sort((a, b) => b[1] - a[1]).slice(0, 3);
console.log("largest:", big.map(([k, b]) => `${k} ${(b / 1e6).toFixed(2)} MB`).join(", "));
