// Address-matching evaluation against the real 2026 roll export.
// Run from nola-assessment-navigator/:  node tests/address_eval.js
// Each case is typed the way an owner might type it. "expect" was written BEFORE running,
// from the roll record we looked up by hand. Writes docs/address-matching-results.md.
const fs = require("fs");
const path = require("path");
const L = require("../lookup.js");

const DIR = path.join(__dirname, "../data/web/2026");
const lookup = L.create(async name => JSON.parse(fs.readFileSync(path.join(DIR, name), "utf8")));

const CASES = [
  { input: "1205 St. Charles Avenue, Apt 607, New Orleans, LA 70130", tests: "unit with Apt, Avenue vs AV, city/ZIP", expect: "exact", id: "102000079" },
  { input: "1205 Saint Charles Ave", tests: "condo building, no unit given", expect: "multiple" },
  { input: "423 Gravier Street #3A", tests: "unit with #", expect: "exact", id: "105100749" },
  { input: "1201 Canal St Unit 273", tests: "unit with Unit", expect: "exact", id: "206104825" },
  { input: "2000 MLK Blvd", tests: "MLK vs MARTIN L KING BL", expect: "exact", id: "101108701" },
  { input: "1632 O.C. Haley Blvd.", tests: "O.C. Haley vs ORETHA C HALEY BL", expect: "exact", id: "101107818" },
  { input: "1050 Jefferson Davis Parkway", tests: "old street name (renamed 2021)", expect: "exact", id: "102206001" },
  { input: "519 General Pershing Street", tests: "General vs GEN", expect: "exact", id: "614103512" },
  { input: "130 Robert E. Lee Blvd", tests: "old street name (renamed 2021)", expect: "exact", id: "206411902" },
  { input: "1122 Tchoupitoulas St", tests: "second address on a multi-address parcel", expect: "exact", id: "102101404" },
  { input: "1116 Tchoupitoulis St", tests: "misspelled street", expect: "close", id: "102101404" },
  { input: "701 S. Claiborne Ave", tests: "roll has no N/S direction", expect: "multiple" },
  { input: "1518 1/2 Melpomene St", tests: "half address vs HF", expect: "exact", id: "101105624" },
  { input: "1514 freret", tests: "lowercase, no suffix", expect: "exact", id: "101110115" },
  { input: "510 Esplanade Avenue", tests: "Avenue vs AV", expect: "exact", id: "208100308" },
  { input: "101100224", tests: "parcel ID instead of address", expect: "exact", id: "101100224" },
  { input: "9999 Magazine St", tests: "house number not on street", expect: "not_found" },
  { input: "3300 Veterans Blvd, Metairie, LA 70002", tests: "address outside Orleans Parish", expect: "not_found" },
  { input: "Magazine Street", tests: "no house number", expect: "not_found" }
];

(async () => {
  const rows = [];
  let pass = 0;
  for (const c of CASES) {
    const r = await lookup.find(c.input);
    const ids = r.candidates.map(x => x.record.id);
    const ok = r.status === c.expect && (!c.id || ids[0] === c.id);
    if (ok) pass++;
    const top = r.candidates[0] ? `${r.candidates[0].record.a} (${r.candidates[0].record.id})` : "—";
    const n = r.total || r.candidates.length;
    rows.push({ ...c, got: r.status, n, top, ok, reason: r.reason });
    console.log(`${ok ? "PASS" : "FAIL"}  ${c.input.padEnd(56)} expect=${c.expect.padEnd(9)} got=${r.status.padEnd(9)} n=${n}  ${top}  ${r.reason || ""}`);
  }
  const counts = s => rows.filter(r => r.got === s).length;
  const cell = s => String(s).replace(/\|/g, "\\|"); // a raw "|" would split the Markdown table cell
  const md = `# Address matching results

Run: \`node tests/address_eval.js\` against the 2026 roll export (\`data/web/2026\`).
Method: \`address.js\` normalizes both the owner's input and the roll's addresses the same way:
- suffixes (Avenue/AV, Boulevard/BL, Highway/HW, Parkway/PW)
- Saint/St and General/GEN
- MLK and O.C. Haley spellings
- 2021 street renames
- units (Apt / # / Unit, or a bare unit after the suffix as the roll writes it)
- half addresses (1/2 vs HF)
- city, state and ZIP tails

It then matches by street name and house number. If the street isn't found, it tries close spellings
(edit distance). A 9-digit input is looked up as a parcel ID.

**Result: ${pass} of ${rows.length} cases behaved as expected.** By status:
- exact: ${counts("exact")}
- multiple, with the owner picking from a list: ${counts("multiple")}
- close match, with the owner confirming: ${counts("close")}
- not found: ${counts("not_found")}

| # | What the owner typed | What it tests | Expected | Got | Matches | Top candidate | OK |
|---|---|---|---|---|---|---|---|
${rows.map((r, i) => `| ${i + 1} | ${cell(r.input)} | ${cell(r.tests)} | ${r.expect} | ${r.got} | ${r.n} | ${cell(r.top)} | ${r.ok ? "✅" : "❌"} |`).join("\n")}

## Why the multiple and not-found cases happen

${rows.filter(r => r.got !== "exact").map(r => `- **${r.input}** → ${r.got}: ${r.reason || "(no reason given)"}`).join("\n")}
`;
  fs.writeFileSync(path.join(__dirname, "../docs/address-matching-results.md"), md);
  console.log(`\n${pass}/${rows.length} as expected`);
})();
