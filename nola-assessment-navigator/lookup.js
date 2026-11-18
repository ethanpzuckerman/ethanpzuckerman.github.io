/* NOLA Assessment Navigator — property lookup over the exported roll files.
   Works in the browser (window.NolaLookup) and in Node (tests). The caller supplies
   loadJSON(name) so the same code reads data/web/2026/*.json from fetch() or from disk. */

(function (root) {
  const A = root.NolaAddress || (typeof require !== "undefined" ? require("./address.js") : null);

  const shardKey = name => (name.replace(/[^A-Z0-9]/g, "").slice(0, 2) || "__");

  function create(loadJSON) {
    let metaP = null, idsP = null;
    const shards = new Map();

    const meta = () => metaP || (metaP = loadJSON("meta.json"));
    const ids = () => idsP || (idsP = loadJSON("ids.json"));
    const shard = k => {
      if (!shards.has(k)) shards.set(k, loadJSON(`s_${k}.json`).catch(() => []));
      return shards.get(k);
    };

    async function byId(id) {
      const k = (await ids())[id];
      if (!k) return null;
      return (await shard(k)).find(r => r.id === id) || null;
    }

    /* Find a property from what an owner types: an address or a parcel ID.
       Returns { status, candidates:[{record, why}], reason, query }. */
    async function find(input) {
      const q = String(input || "").trim();
      // Parcel IDs: most are 9 digits, but many have letters ("39W305216") or 10 digits. Check the ID list itself.
      const id = q.replace(/[\s-]/g, "").toUpperCase();
      if (/^\d[0-9A-Z]{6,11}$/.test(id) && /\d{4}/.test(id) && !/\s\D{3,}/.test(q)) {
        const rec = await byId(id);
        if (rec) return { status: "exact", candidates: [{ record: rec, why: "parcel ID" }], reason: "", query: { raw: q } };
        if (/^[0-9A-Z]+$/.test(q.replace(/[\s-]/g, "").toUpperCase()) && !/\s/.test(q.replace(/-/g, ""))) {
          return { status: "not_found", candidates: [], reason: `No parcel with ID ${id} in the 2026 roll. Check the number on your tax bill.`, query: { raw: q } };
        }
      }
      const p = A.parse(q);
      if (!p.number || !p.name) return A.match(A.buildIndex([]), q);

      // Load the file for this street, plus files for close spellings if the name isn't in the roll.
      const m = await meta();
      const keys = new Set([shardKey(p.name)]);
      if (!m.streets[p.name]) {
        const limit = Math.max(1, Math.floor(p.name.length / 5));
        for (const n of Object.keys(m.streets)) if (A.levenshtein(n, p.name) <= limit) keys.add(shardKey(n));
      }
      const records = (await Promise.all([...keys].map(shard))).flat();
      const index = A.buildIndex(records.map(r => ({ id: r.id, address: r.a, data: r })));
      const res = A.match(index, q);
      res.candidates = res.candidates.map(c => ({ record: c.record.data, why: c.why }));
      // The roll drops N/S from addresses, but legal descriptions often keep it ("S CLAIBORNE").
      // When the owner gave a direction, list records whose legal description agrees first.
      if (res.status === "multiple" && p.dir) {
        const mention = new RegExp(`\\b${p.dir}\\.? ?${p.name.split(" ")[0]}\\b`);
        const agrees = c => mention.test(c.record.legal || "");
        res.candidates.sort((a, b) => agrees(b) - agrees(a));
        res.candidates.forEach(c => { if (agrees(c)) c.why += `; legal description says ${p.dir} ${p.name}`; });
        const n = res.candidates.filter(agrees).length;
        if (n) res.reason += ` ${n} of them ${n === 1 ? "has" : "have"} "${p.dir} ${p.name}" in the legal description, listed first.`;
      }
      return res;
    }

    /* Nearby parcels from the location index (pipeline/near_index.py): every parcel within radius metres,
       nearest first, as { id, a, occ, tmv, t26, lat, lon, dist }. Loads only the grid cells the circle touches. */
    const CELL = 0.02, cells = new Map();
    const cellFile = (i, j) => {
      const k = i + "_" + j;
      if (!cells.has(k)) cells.set(k, Promise.resolve().then(() => loadJSON(`n_${k}.json`)).catch(() => []));
      return cells.get(k);
    };
    const metres = (lat1, lon1, lat2, lon2) => {
      const R = 6371000, toR = Math.PI / 180, dLat = (lat2 - lat1) * toR, dLon = (lon2 - lon1) * toR;
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };
    async function near(lat, lon, radius) {
      if (typeof lat !== "number" || typeof lon !== "number") return [];
      const dLat = radius / 111000, dLon = radius / (111000 * Math.cos(lat * Math.PI / 180));
      const jobs = [];
      for (let i = Math.floor((lat - dLat) / CELL); i <= Math.floor((lat + dLat) / CELL); i++)
        for (let j = Math.floor(-(lon + dLon) / CELL); j <= Math.floor(-(lon - dLon) / CELL); j++) jobs.push(cellFile(i, j));
      const out = [];
      for (const rows of await Promise.all(jobs)) for (const x of rows) {
        const dist = metres(lat, lon, x[5], x[6]);
        if (dist <= radius) out.push({ id: x[0], a: x[1], occ: x[2], tmv: x[3], t26: x[4], lat: x[5], lon: x[6], dist });
      }
      return out.sort((p, q) => p.dist - q.dist);
    }

    /* Approximate location for a parcel the crosswalk didn't place (about 15% of parcels): the parcel on the same
       street (same direction, name and suffix) with the closest house number that has coordinates, if it is
       within 200 numbers. Returns { lat, lon, bg, from, gap } or null. The dashboard labels it "approximate". */
    async function approx(rec) {
      if (!rec || typeof rec.lat === "number") return null;
      const p = A.parse(String(rec.a || "").split("|")[0]);
      const n = parseInt(p.number, 10);
      const rows = p.name && n ? await shard(shardKey(p.name)) : [];
      let best = null;
      for (const x of rows) {
        if (typeof x.lat !== "number" || x.id === rec.id) continue;
        const q = A.parse(String(x.a || "").split("|")[0]);
        if (q.name !== p.name || q.dir !== p.dir || q.suffix !== p.suffix) continue;
        const gap = Math.abs(parseInt(q.number, 10) - n);
        if (isNaN(gap) || gap > 200) continue;
        const sameSide = (parseInt(q.number, 10) - n) % 2 === 0;
        const score = gap + (sameSide ? 0 : 0.5);
        if (!best || score < best.score) best = { score, lat: x.lat, lon: x.lon, bg: x.bg || null, from: String(x.a).replace(/\s+/g, " ").trim(), gap };
      }
      if (best) return { lat: best.lat, lon: best.lon, bg: best.bg, from: best.from, gap: best.gap, kind: "street" };
      // Otherwise the center of its roll subdivision, then its ward (pipeline/near_index.py arealoc.json).
      let centers = null;
      try { centers = await (arealocP || (arealocP = Promise.resolve().then(() => loadJSON("arealoc.json")))); } catch (e) { arealocP = null; }
      if (!centers) return null;
      const sub = rec.sub && centers[`s|${rec.d}|${rec.sub}`], ward = centers[`w|${rec.d}|${rec.w}`];
      const c = sub || ward;
      return c ? { lat: c[0], lon: c[1], bg: c[2], kind: sub ? "subdivision" : "ward", n: c[3] } : null;
    }
    let arealocP = null;

    return { find, byId, meta, near, metres, approx };
  }

  const api = { create, shardKey };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NolaLookup = api;
})(typeof window !== "undefined" ? window : this);
