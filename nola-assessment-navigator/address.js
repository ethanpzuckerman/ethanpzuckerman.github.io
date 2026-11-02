/* NOLA Assessment Navigator — address normalization and matching.
   One implementation shared by the browser (window.NolaAddress) and the
   Node data pipeline (require("./address.js")), so user input and roll
   records are normalized the same way. See CLAUDE.md §3 (Address matching). */

(function (root) {
  const DIRECTIONS = { NORTH: "N", SOUTH: "S", EAST: "E", WEST: "W", N: "N", S: "S", E: "E", W: "W" };

  // USPS street suffixes seen in Orleans Parish, mapped to their standard abbreviation.
  const SUFFIXES = {
    STREET: "ST", STR: "ST", ST: "ST",
    AVENUE: "AVE", AVEN: "AVE", AV: "AVE", AVE: "AVE",
    BOULEVARD: "BLVD", BOUL: "BLVD", BLV: "BLVD", BLVD: "BLVD",
    DRIVE: "DR", DRV: "DR", DR: "DR",
    ROAD: "RD", RD: "RD",
    PLACE: "PL", PL: "PL",
    COURT: "CT", CRT: "CT", CT: "CT",
    LANE: "LN", LN: "LN",
    PARKWAY: "PKWY", PKY: "PKWY", PKWY: "PKWY",
    HIGHWAY: "HWY", HWY: "HWY",
    CIRCLE: "CIR", CIR: "CIR",
    TERRACE: "TER", TERR: "TER", TER: "TER",
    SQUARE: "SQ", SQ: "SQ",
    PLAZA: "PLZ", PLZ: "PLZ",
    EXPRESSWAY: "EXPY", EXPY: "EXPY",
    ALLEY: "ALY", ALY: "ALY",
    COVE: "CV", CV: "CV",
    POINT: "PT", PT: "PT",
    WAY: "WAY", ROW: "ROW", WALK: "WALK", LOOP: "LOOP", TRACE: "TRCE", TRCE: "TRCE"
  };

  const ORDINALS = {
    FIRST: "1ST", SECOND: "2ND", THIRD: "3RD", FOURTH: "4TH", FIFTH: "5TH", SIXTH: "6TH",
    SEVENTH: "7TH", EIGHTH: "8TH", NINTH: "9TH", TENTH: "10TH", ELEVENTH: "11TH", TWELFTH: "12TH"
  };

  const UNIT_WORDS = new Set(["APT", "APARTMENT", "UNIT", "STE", "SUITE", "BLDG", "BUILDING", "FL", "FLOOR", "RM", "ROOM", "LOT", "SPC", "SPACE"]);

  // Local name variants, applied to the street name after suffix and direction are removed.
  // Extend this list as address tests turn up new ones (record each in CLAUDE.md §3).
  const ALIASES = [
    [/^(DR )?(MARTIN LUTHER KING( JR)?|M L KING( JR)?|ML KING( JR)?|MLK( JR)?)$/, "MARTIN LUTHER KING JR"],
    [/^(ORETHA CASTLE HALEY|O C HALEY|OC HALEY)$/, "ORETHA CASTLE HALEY"],
    [/^GEN /, "GENERAL "],
    [/^SAINT /, "ST "],
    [/^FT /, "FORT "],
    [/^MT /, "MOUNT "]
  ];

  const CITY_TAIL = /\b(NEW ORLEANS|NOLA|LOUISIANA|LA|USA)\b/g;

  function clean(s) {
    return String(s || "").toUpperCase()
      .replace(/&/g, " AND ")
      .replace(/#\s*/g, " UNIT ")
      .replace(/[.,;:'"()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* Parse a free-form address into parts. Never throws; missing parts are "". */
  function parse(input) {
    let s = clean(input);
    const out = { raw: String(input || ""), number: "", numberHigh: "", half: false, dir: "", name: "", suffix: "", unit: "", zip: "" };

    const zip = s.match(/\b(70\d{3})(-\d{4})?\b/);
    if (zip) { out.zip = zip[1]; s = s.replace(zip[0], " "); }
    s = s.replace(CITY_TAIL, " ").replace(/\s+/g, " ").trim();

    let t = s.split(" ").filter(Boolean);

    // House number: "1234", "1234A", "1234-36", "1234 1/2".
    const num = t[0] && t[0].match(/^(\d+)([A-Z]?)(?:-(\d+)([A-Z]?))?$/);
    if (num) {
      out.number = num[1] + num[2];
      if (num[3]) out.numberHigh = expandRange(num[1], num[3]);
      t = t.slice(1);
      if (t[0] === "1/2") { out.half = true; t = t.slice(1); }
    }

    // Unit: everything after a unit word, or a trailing lone "UNIT"-less token like "3B" after a suffix.
    const ui = t.findIndex(w => UNIT_WORDS.has(w));
    if (ui >= 0) {
      out.unit = t.slice(ui + 1).filter(w => !UNIT_WORDS.has(w)).join(" ");
      t = t.slice(0, ui);
    }

    // Leading direction (N RAMPART ST); trailing direction is rare here but handled.
    if (t.length > 1 && DIRECTIONS[t[0]]) { out.dir = DIRECTIONS[t[0]]; t = t.slice(1); }
    if (t.length > 1 && DIRECTIONS[t[t.length - 1]]) { out.dir = out.dir || DIRECTIONS[t[t.length - 1]]; t = t.slice(0, -1); }

    // Suffix is the last token if it's a known suffix. "ST" before another word is "Saint".
    if (t.length > 1 && SUFFIXES[t[t.length - 1]]) { out.suffix = SUFFIXES[t[t.length - 1]]; t = t.slice(0, -1); }
    // Trailing unit with no unit word, e.g. "1000 MAGAZINE ST 3B" was split above only if a unit word existed.

    t = t.map(w => ORDINALS[w] || w);
    let name = t.join(" ");
    for (const [re, rep] of ALIASES) name = name.replace(re, rep);
    out.name = name.trim();
    return out;
  }

  // "1234-36" → "1236"; "1234-1240" → "1240".
  function expandRange(low, high) {
    if (high.length >= low.length) return high;
    return low.slice(0, low.length - high.length) + high;
  }

  function streetKey(p) { return [p.dir, p.name, p.suffix].filter(Boolean).join(" "); }
  function fullKey(p) { return [p.number + (p.half ? " 1/2" : ""), streetKey(p), p.unit ? "UNIT " + p.unit : ""].filter(Boolean).join(" "); }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  function numInRange(n, rec) {
    const v = parseInt(n, 10), lo = parseInt(rec.number, 10), hi = parseInt(rec.numberHigh || rec.number, 10);
    return Number.isFinite(v) && v >= lo && v <= hi;
  }

  /* Build an index over records. Each record needs an `address` string and an `id`. */
  function buildIndex(records) {
    const byName = new Map();
    const parsed = records.map(r => ({ rec: r, p: parse(r.address) }));
    for (const x of parsed) {
      if (!byName.has(x.p.name)) byName.set(x.p.name, []);
      byName.get(x.p.name).push(x);
    }
    return { byName, names: [...byName.keys()], size: records.length };
  }

  /* Match a user's address against the index.
     status: "exact" | "multiple" | "close" | "not_found"; candidates carry the reason they matched. */
  function match(index, input, opts) {
    const max = (opts && opts.max) || 10;
    const q = parse(input);
    const result = { query: q, status: "not_found", candidates: [], reason: "" };
    if (!q.number) { result.reason = "No house number found. Enter it like \"1234 Magazine St\"."; return result; }
    if (!q.name) { result.reason = "No street name found."; return result; }

    let pool = index.byName.get(q.name) || [];
    let nameNote = "";
    if (!pool.length) {
      // Close street-name spellings (typos, "Tchoupitoulas" variants).
      const near = index.names
        .map(n => ({ n, d: levenshtein(n, q.name) }))
        .filter(x => x.d <= Math.max(1, Math.floor(q.name.length / 5)))
        .sort((a, b) => a.d - b.d);
      if (!near.length) { result.reason = `No street named "${q.name}" in the roll.`; return result; }
      pool = near.flatMap(x => index.byName.get(x.n));
      nameNote = `street spelled "${near[0].n}" in the roll`;
    }

    const sameNumber = pool.filter(x => x.p.number === q.number || (x.p.numberHigh && numInRange(q.number, x.p)));
    if (!sameNumber.length) {
      result.reason = `"${q.name}" is in the roll, but not house number ${q.number}.`;
      return result;
    }

    // Narrow by direction and suffix when the user gave them, but only if something survives.
    let c = sameNumber;
    const narrow = (list, pred) => { const k = list.filter(pred); return k.length ? k : list; };
    if (q.dir) c = narrow(c, x => x.p.dir === q.dir);
    if (q.suffix) c = narrow(c, x => x.p.suffix === q.suffix);
    if (q.unit) c = narrow(c, x => x.p.unit === q.unit);

    result.candidates = c.slice(0, max).map(x => ({
      record: x.rec,
      parsed: x.p,
      why: [
        x.p.number === q.number ? "same house number" : `house number range ${x.p.number}-${x.p.numberHigh}`,
        nameNote || "same street",
        q.suffix && x.p.suffix && x.p.suffix !== q.suffix ? `suffix differs (${x.p.suffix})` : "",
        q.dir && x.p.dir !== q.dir ? `direction differs (${x.p.dir || "none"})` : "",
        x.p.unit ? `unit ${x.p.unit}` : ""
      ].filter(Boolean).join("; ")
    }));
    result.total = c.length;

    const conflicts = result.candidates.some(x => /differs/.test(x.why));
    if (c.length === 1 && !nameNote && !conflicts) result.status = "exact";
    else if (c.length === 1) result.status = "close";
    else result.status = "multiple";
    if (result.status === "multiple") {
      const units = c.filter(x => x.p.unit).length;
      result.reason = units ? `${c.length} records at this address (${units} with unit numbers). Pick yours.` : `${c.length} records share this address. Pick yours.`;
    }
    if (result.status === "close") result.reason = `Closest match: ${result.candidates[0].why}. Please confirm it's your property.`;
    return result;
  }

  const api = { parse, streetKey, fullKey, buildIndex, match, levenshtein };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NolaAddress = api;
})(typeof window !== "undefined" ? window : this);
