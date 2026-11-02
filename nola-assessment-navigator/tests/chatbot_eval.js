// Runs the 10 test questions in the real page (Playwright) and checks each answer against
// values pulled from the raw roll (tests/chatbot_expected.json). Needs a local server:
//   python3 -m http.server 8765   (from nola-assessment-navigator/)   then   node tests/chatbot_eval.js
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
const E = require("./chatbot_expected.json");
const usd = v => "$" + Number(v).toLocaleString("en-US");

const CASES = [
  { prop: "1205 St. Charles Ave Apt 607", q: "What is my property's market value?",
    expect: `Recorded market value ${usd(E.condo["Total Market Value"])} = land ${usd(E.condo["Land Market Value"])} + buildings ${usd(E.condo["Improvement Market Value"])}`,
    must: [usd(E.condo["Total Market Value"]), usd(E.condo["Land Market Value"]), usd(E.condo["Improvement Market Value"]), "RECORDED"] },
  { prop: "1205 St. Charles Ave Apt 607", q: "How much tax will I pay?",
    expect: `Taxable ${usd(E.condo["Taxable Assessed Value"])} (recorded); × 121.20 mills ≈ $857 (calculated, labeled rough and unverified)`,
    must: [usd(E.condo["Taxable Assessed Value"]), "$857", "CALCULATED", "Rough estimate", "not yet verified"] },
  { prop: "423 Gravier St #3A", q: "Do I have a homestead exemption?",
    expect: `Yes, ${usd(E.gravier["Homestead Exemption Amount"])} of assessed value`,
    must: [usd(E.gravier["Homestead Exemption Amount"]), "Homestead exemption"] },
  { prop: "1503 Tchoupitoulas St", q: "Why is my assessed value what it is?",
    expect: `${usd(E.frozen["Total Assessed Value"])} ÷ ${usd(E.frozen["Total Market Value"])} = 7.9%, below 10% because of the freeze`,
    must: [usd(E.frozen["Total Assessed Value"]), "7.9%", "freeze"] },
  { prop: "934 Melpomene St", q: "Why is my taxable value zero?",
    expect: `${usd(E.veteran100["Total Assessed Value"])} − ${usd(E.veteran100["Homestead Exemption Amount"])} homestead − ${usd(E.veteran100["Veteran Exemption Amount"])} veteran = $0`,
    must: ["$0", usd(E.veteran100["Veteran Exemption Amount"]), usd(E.veteran100["Homestead Exemption Amount"])] },
  { prop: "1770 Tchoupitoulas St", q: "How much tax will I pay?",
    expect: `Taxable $0 because the parcel is exempt: other exemption ${usd(E.exempt["Other Exemption Amount"])} = full assessed value`,
    must: ["$0", "exempt", usd(E.exempt["Other Exemption Amount"])] },
  { prop: "1205 St. Charles Ave Apt 607", q: "How did my value change from 2025?",
    expect: "I don't know: only the 2026 roll is loaded; will match 2025 by parcel ID",
    must: ["I don't know", "2025", E.condo["Parcel ID(s)"]] },
  { prop: "1205 St. Charles Ave Apt 607", q: "How many square feet is my house?",
    expect: "I don't know: square footage isn't in this roll",
    must: ["I don't know", "square footage"] },
  { prop: "1205 St. Charles Ave Apt 607", q: "Who owns this property?",
    expect: "Won't show owner names (privacy); points to the Assessor's search",
    must: ["don't show owner names"] },
  { prop: null, q: "701 S Claiborne Ave",
    expect: "3 records share the address; the one whose legal description says S CLAIBORNE (District 1) is listed first",
    must: ["3 records", "S CLAIBORNE", "District 1"] }
];

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const p = await b.newPage({ viewport: { width: 820, height: 1000 }, deviceScaleFactor: 2 });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const rows = [];
  for (const [i, c] of CASES.entries()) {
    await p.goto("http://localhost:8765/index.html");
    if (c.prop) {
      await p.fill("#addr", c.prop); await p.click("#find button");
      await p.waitForSelector(".pick"); await p.click(".pick");
      await p.fill("#q", c.q); await p.click("#ask button");
    } else {
      await p.fill("#addr", c.q); await p.click("#find button");
      await p.waitForSelector(".pick");
    }
    await p.waitForTimeout(200);
    const last = p.locator(".msg.bot").last();
    const text = await last.innerText();
    const missing = c.must.filter(m => !text.includes(m));
    const shot = `docs/screenshots/week2/t${String(i + 1).padStart(2, "0")}.png`;
    // Screenshot the question and the answer together.
    await p.evaluate(() => { const l = document.querySelectorAll(".msg"); l.forEach((m, k) => { if (k < l.length - 2) m.style.display = "none"; }); });
    await p.locator("#log").screenshot({ path: path.join(__dirname, "..", shot) });
    rows.push({ n: i + 1, ...c, ok: missing.length === 0, missing, shot, got: text.replace(/\s+/g, " ").slice(0, 260) });
    console.log(`${missing.length ? "FAIL" : "PASS"} ${i + 1}. ${c.q} ${missing.length ? "missing: " + missing.join(", ") : ""}`);
  }
  await b.close();
  fs.writeFileSync(path.join(__dirname, "chatbot_eval_results.json"), JSON.stringify(rows, null, 2));
  console.log(`${rows.filter(r => r.ok).length}/${rows.length} passed`);
})();
