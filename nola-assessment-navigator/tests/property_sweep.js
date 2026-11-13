// Run: node tests/property_sweep.js (after pipeline/shard.js, area_stats.py and census_bg.py).
// 1. Asks every property question type about 305 sampled parcels of every kind.
// 2. Asks the questions whose answers depend most on the data (tax, 2026→2027 change, area, neighborhood)
//    about EVERY parcel in the roll.
// Flags broken output and claims the record doesn't support.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const D = path.join(ROOT, "data/web/2026");
const P = require(path.join(ROOT, "property.js"));
const meta = JSON.parse(fs.readFileSync(path.join(D, "meta.json")));
meta.areas = JSON.parse(fs.readFileSync(path.join(D, "areas.json")));
meta.bg = JSON.parse(fs.readFileSync(path.join(D, "bg.json")));
meta.now = new Date("2026-11-13T12:00:00-06:00");
meta.appealStatus = "Status: the appeal window for the 2027 roll closed.";
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
  "How much tax will I pay?", "What will my 2027 bill be?", "Do I have a homestead exemption?", "Do I have an assessment freeze?",
  "Do I have a veteran exemption?", "What exemptions do I have?", "How did my value change on the 2027 roll?", "Why did my taxes go up?",
  "How many square feet is my house?", "When was it built?", "When was it sold?", "Who owns this property?", "What district is it in?",
  "I think my value is wrong", "How does my property compare to others in my area?", "What neighborhood is it in?",
  "Am I in the Downtown Development District?", "What is my parcel number?"];
const EXPECT = { "What will my 2027 bill be?": "tax", "Why did my taxes go up?": "compare", "What exemptions do I have?": "exemptions",
  "How does my property compare to others in my area?": "area", "What neighborhood is it in?": "place",
  "Am I in the Downtown Development District?": "special", "What is my parcel number?": "pid" };

const problems = [];
const text = a => a.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
function check(r, q, a) {
  if (!a) { problems.push([r.id, q, "no answer"]); return; }
  const t = text(a);
  if (EXPECT[q] && a.intent !== EXPECT[q]) problems.push([r.id, q, `routed to ${a.intent}, expected ${EXPECT[q]}`]);
  if (/undefined|NaN|\bnull\b|\[object/.test(t)) problems.push([r.id, q, "bad token: " + (t.match(/.{30}(undefined|NaN|\bnull\b|\[object).{10}/) || [""])[0]]);
  if (/\$-|−\$0\b|\+\$0\b/.test(t)) problems.push([r.id, q, "bad dollar formatting: " + (t.match(/.{60}(\$-|−\$0\b|\+\$0\b).{20}/) || [""])[0]]);
  if (/all of it from the millage/.test(t)) problems.push([r.id, q, "blames millage alone"]);
  if (/Matches the recorded amount/.test(t)) {
    const ml = r.ml26 || meta.mills["2026"][r.d];
    if (Math.abs(r.tav * ml / 1000 - (r.th26 || 0) - r.t26) > 2) problems.push([r.id, q, "false match claim"]);
  }
  if (/This matches the recorded value/.test(t) && Math.abs(Math.max(0, (r.tav || 0) - (r.hs || 0) - (r.ve || 0) - (r.fr || 0) - (r.oe || 0)) - (r.tx || 0)) > 1)
    problems.push([r.id, q, "false taxable match claim"]);
  if (/I don't know/.test(t) && !a.contact) problems.push([r.id, q, "'I don't know' without a human contact"]);
  if (a.intent === "compare" && "h27" in r && r.h27 !== (r.hs || 0) && !/homestead/.test(t)) problems.push([r.id, q, "homestead change not named"]);
  if (a.intent === "tax" && !r.no27 && typeof r.t27 === "number" && !/2027 roll \(your next bill/.test(t)) problems.push([r.id, q, "next bill isn't the 2027 roll"]);
  if (!r.tmv && !r.tav && /\$0 ÷ \$0/.test(t)) problems.push([r.id, q, "placeholder $0 treated as a value"]);

}
for (const r of sample) for (const q of Q) check(r, q, P.answer(r, q, meta));
const sampled = sample.length * Q.length;

// Privacy: the web export may only carry these public fields (no owner names, mailing addresses or prices).
const ALLOWED = new Set("id a d w sub occ st yb td it fz hsp vt legal n lmv imv tmv lav iav tav hs oe ve fr tx t26 ml26 th26 m27 a27 h27 x27 t27 ml27 th27 st27 td27 no27 bg lat lon ge".split(" "));
for (const r of uniq) for (const k of Object.keys(r)) if (!ALLOWED.has(k)) { problems.push([r.id, k, "unexpected field in web data"]); break; }

const FULL = ["What will my 2027 bill be?", "Why did my taxes go up?", "How does my property compare to others in my area?", "What neighborhood is it in?", "What exemptions do I have?"];
let full = 0;
for (const r of uniq) for (const q of FULL) { check(r, q, P.answer(r, q, meta)); full++; }

console.log(`sample: ${sample.length} parcels × ${Q.length} questions = ${sampled} answers`);
console.log(`every parcel: ${uniq.length} parcels × ${FULL.length} questions = ${full} answers`);
console.log(`problems: ${problems.length}`);
const byKind = {};
for (const p of problems) byKind[p[2].replace(/:.*/, "")] = (byKind[p[2].replace(/:.*/, "")] || 0) + 1;
console.log(byKind);
console.log(problems.slice(0, 12));
