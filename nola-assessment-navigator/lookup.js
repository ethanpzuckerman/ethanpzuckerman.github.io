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

    /* Find a property from what an owner types: an address or a 9-digit parcel ID.
       Returns { status, candidates:[{record, why}], reason, query }. */
    async function find(input) {
      const q = String(input || "").trim();
      const digits = q.replace(/[\s-]/g, "");
      if (/^\d{9}$/.test(digits)) {
        const rec = await byId(digits);
        return rec
          ? { status: "exact", candidates: [{ record: rec, why: "parcel ID" }], reason: "", query: { raw: q } }
          : { status: "not_found", candidates: [], reason: `No parcel with ID ${digits} in the 2026 roll.`, query: { raw: q } };
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

    return { find, byId, meta };
  }

  const api = { create, shardKey };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NolaLookup = api;
})(typeof window !== "undefined" ? window : this);
