// Run: node tests/property_sweep.js (after pipeline/shard.js). Asks every property question type about 300 random parcels of every kind; flag broken or untrue output.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const D = path.join(ROOT, "data/web/2026");
const P = require(path.join(ROOT, "property.js"));
const meta = JSON.parse(fs.readFileSync(path.join(D, "meta.json")));
const all = [];
for (const f of fs.readdirSync(D)) if (f.startsWith("s_")) for (const r of JSON.parse(fs.readFileSync(path.join(D, f)))) all.push(r);
const uniq = [...new Map(all.map(r => [r.id, r])).values()];
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (f, k) => { const xs = uniq.filter(f); return Array.from({ length: k }, () => xs[Math.floor(rnd() * xs.length)]); };
const sample = [
  ...pick(r => r.occ === "RESIDENTIAL" && r.hs, 60), ...pick(r => r.occ === "RESIDENTIAL" && !r.hs, 40),
  ...pick(r => r.occ === "COMMERCIAL", 40), ...pick(r => r.occ === "VACANT LAND", 40), ...pick(r => r.st === "EX", 30),
  ...pick(r => r.fz && r.fz !== "0", 30), ...pick(r => r.ve, 20), ...pick(r => r.fr, 10), ...pick(r => r.n > 1, 20),
  ...pick(r => r.no27, 5), ...pick(r => "m27" in r, 10)
].filter(Boolean);
const Q = ["What is my property's market value?", "Why is my assessed value what it is?", "Why is my taxable value zero?",
  "How much tax will I pay?", "Do I have a homestead exemption?", "Do I have an assessment freeze?", "Do I have a veteran exemption?",
  "How did my value change from 2025?", "How many square feet is my house?", "When was it built?", "When was it sold?",
  "Who owns this property?", "What district is it in?", "I think my value is wrong"];
const problems = [];
for (const r of sample) for (const q of Q) {
  const a = P.answer(r, q, meta);
  if (!a) { problems.push([r.id, q, "no answer"]); continue; }
  const t = a.html.replace(/<[^>]+>/g, " ");
  if (/undefined|NaN|null|\[object/.test(t)) problems.push([r.id, q, "bad token: " + t.match(/.{30}(undefined|NaN|null|\[object).{10}/)?.[0]]);
  if (/Matches the recorded amount/.test(t)) {
    const ml = r.ml26 || meta.mills["2026"][r.d];
    if (Math.abs(r.tav * ml / 1000 - (r.th26 || 0) - r.t26) > 2) problems.push([r.id, q, "false match claim"]);
  }
  if (/\$-/.test(t)) problems.push([r.id, q, "negative dollar formatting"]);
}
console.log(`parcels ${sample.length} × ${Q.length} questions = ${sample.length * Q.length} answers; problems: ${problems.length}`);
console.log(problems.slice(0, 15));
const kinds = {}; for (const r of sample) for (const q of Q) { const a = P.answer(r, q, meta); kinds[a && a.intent] = (kinds[a && a.intent] || 0) + 1; }
console.log(kinds);
