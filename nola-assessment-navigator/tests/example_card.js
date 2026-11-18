// The home page's example-property card shows numbers written into index.html. This test checks every one of
// them against the data, so the card can't drift from the roll. Run: node tests/example_card.js
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const L = require(path.join(ROOT, "lookup.js")).create(f => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, "data/web/2026", f)))));
const usd = v => "$" + Math.round(v).toLocaleString("en-US");
(async () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const id = (html.match(/class="preview" data-id="([^"]+)"/) || [])[1];
  const r = await L.byId(id), meta = await L.meta();
  const want = { tmv: usd(r.tmv), hs: r.hs ? usd(r.hs) : "None", t26: usd(r.t26), t27: usd(r.t27), tav: usd(r.tav), th26: usd(r.th26), mills: String(meta.mills["2026"][r.d]) };
  let bad = 0;
  for (const m of html.matchAll(/data-k="(\w+)">([^<]+)</g)) {
    const ok = want[m[1]] === m[2];
    if (!ok) bad++;
    console.log(`${ok ? "PASS" : "FAIL"} ${m[1]}: page ${m[2]}, data ${want[m[1]]}`);
  }
  console.log(bad ? `${bad} mismatches` : "example card matches the data");
  process.exit(bad ? 1 : 0);
})();
