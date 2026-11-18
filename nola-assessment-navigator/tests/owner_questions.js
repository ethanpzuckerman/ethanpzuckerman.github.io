// The final test set: 25 questions the way New Orleans owners ask them, each with the answer we expected BEFORE
// running, checked in the real page. Run from nola-assessment-navigator/ with a server on port 8765:
//   node tests/owner_questions.js [label]      (label, e.g. "first-run", names the results file)
// Writes tests/owner_questions_<label>.json. tests/owner_report.js turns the runs into docs/test-set-25.md.
const fs = require("fs");
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const URL = process.env.NAV_URL || "http://localhost:8765/index.html";
const label = process.argv[2] || "final";

// origin: where the question comes from. must / mustNot: regular expressions the answer has to (not) match.
const CASES = [
  // ---- Layer 1: general guidance ----
  { layer: 1, origin: "City Council notice on rising 2024 assessments; WWL explainer", q: "My assessment went up but I didn't do anything to the house. Why?",
    expect: "Mass appraisal follows sales of similar homes; values are reset every four years (as of Jan. 1, 2023 for 2024–27); a higher value doesn't raise the bill by the same percent. Cites the auditor's report.",
    must: ["similar homes", "Jan\\. 1, 2023", "S15"] },
  { layer: 1, origin: "Assessor's homestead reminders (Biz New Orleans)", q: "what is the homestead exemption and how much does it save me",
    expect: "$7,500 of assessed value = first $75,000 of market value; own and occupy; doesn't reduce the police and fire mills. A dollar figure for the savings ($903.60 a year in the $300,000 East Bank example).",
    must: ["\\$7,500", "\\$75,000", "\\$903\\.60"] },
  { layer: 1, origin: "News: Assessor cancelled thousands of homestead exemptions (Biz New Orleans, 2023)", q: "I got a letter saying my homestead exemption was cancelled. What do I do?",
    expect: "Says plainly it doesn't know why this one was cancelled; explains the own-and-occupy rule and when an exemption ends (sale, move, death, deed change); sends the owner to the Assessor's Office quickly, with contacts.",
    must: ["I don't know", "own and (live in|occupy)|owned and occupied", "754-8811"], mustNot: ["Where to review the roll"] },
  { layer: 1, origin: "Part 1 outline question; Nov. 3, 2026 Amendment 9", q: "I'm 67 and on a fixed income. Is there any break for seniors?",
    expect: "The Special Assessment Level freeze: 65+, homestead, income limit $100,000 rising to $150,000 on Jan. 1, 2027; freezes assessed value, not the bill.",
    must: ["Special Assessment Level", "\\$150,000", "assessed value"] },
  { layer: 1, origin: "City Treasury FAQ", q: "When are property taxes due in New Orleans?",
    expect: "Treasury usually says Jan. 31; 2026 bills were due Feb. 28, 2026; the 2027 date isn't announced; 1% a month interest. Contacts.",
    must: ["Feb\\. 28, 2026", "1% per month", "hasn't (announced|been confirmed)|isn't announced|hasn't announced"] },
  { layer: 1, origin: "Part 1 sample question (the bot failed it then)", q: "I can't afford my tax bill. Can I pay monthly?",
    expect: "No formal installment plan; partial payments in person or by mail, not online; 1% a month on the balance. Treasury contact.",
    must: ["doesn't offer a formal installment plan", "partial payments", "S34"] },
  { layer: 1, origin: "Outside QA pass (695 interactions)", q: "My mom passed away and I live in her house. Do I keep her homestead exemption?",
    expect: "Heirs who live in the home get the exemption on their ownership share; a succession may be needed; says it doesn't know what the Assessor requires; legal aid contact.",
    must: ["ownership share", "succession", "I don't know"] },
  { layer: 1, origin: "Instructor feedback on Part 1", q: "I rent out one side of my shotgun double and live in the other. Do I still get homestead?",
    expect: "Yes on the home you own and occupy, one per person; plainly says it doesn't know how the rented half is treated; Assessor contact.",
    must: ["owned and occupied", "I don't know", "754-8811"] },
  { layer: 1, origin: "Part 1 outline question", q: "What's the deadline to appeal my assessment?",
    expect: "Today's status first: the 2027-roll window closed 4 p.m. Aug. 20, 2026; next window summer 2027; then the steps.",
    must: ["closed", "Aug\\. 20, 2026", "summer 2027"] },
  { layer: 1, origin: "Common owner worry (auditor's report discusses inspections)", q: "Do I have to let the assessor inside my house?",
    expect: "The sources don't answer this, so: a plain \"I don't know\" and the Assessor's contact. It must not answer a different question as if it were this one.",
    must: ["I don't know", "754-8811"] },
  { layer: 1, origin: "Project brief (2027 reassessment)", q: "Is the 2027 reassessment going to raise my taxes?",
    expect: "The 2027 roll isn't a reappraisal (values as of Jan. 1, 2023 through 2027); 2027 bills rise mainly from millage (levee, Council roll-forward of 4.039 mills); next reappraisal expected for 2028, labeled as inferred.",
    must: ["4\\.039", "2024 through 2027|through tax year 2027", "S15"] },
  // ---- Layer 2: my property ----
  { layer: 2, origin: "The address the instructor typed in class (Nov. 4)", find: "1726 St. Charles Ave", q: null,
    expect: "One record, 1726 ST CHARLES AV, commercial, market value $773,900; asks the owner to confirm.",
    must: ["one record", "1726 ST CHARLES AV", "\\$773,900"] },
  { layer: 2, origin: "Instructor's description of Layer 2 (\"why is your assessment what it is?\")", prop: "1726 St. Charles Ave", q: "Why is my assessment what it is?",
    expect: "Recorded assessed $92,510 on $773,900 market = 12%; explains the 10% land + 15% building rule for non-residential buildings; labeled recorded / calculated.",
    must: ["\\$92,510", "\\$773,900", "15%", "RECORDED", "CALCULATED"], mustNot: ["doesn't match"] },
  { layer: 2, origin: "Outside QA pass", prop: "1332 Magazine St", q: "What will my tax bill be in January?",
    expect: "Leads with the 2027 roll ($5,077) as the next bill, then 2026 ($5,021); the Council roll-forward as a calculated range ($151 to $181); special districts not included.",
    must: ["2027 roll \\(your next bill[\\s\\S]*\\$5,077", "\\$5,021", "\\$151 to \\$181", "special-district"] },
  { layer: 2, origin: "Outside QA pass (homestead removed on the 2027 roll)", prop: "212 12th St", q: "Why did my taxes go up $900?",
    expect: "$3,473 → $4,426 (+$953) because the homestead exemption is gone on the 2027 roll, plus the millage change; says the roll doesn't say why and to contact the Assessor.",
    must: ["\\$3,473", "\\$4,426", "homestead exemption was removed", "754-8811"], mustNot: ["all of it from the millage"] },
  { layer: 2, origin: "Instructor (Nov. 4): don't expect bathrooms or pools", prop: "1205 St. Charles Ave Apt 607", q: "Does the assessor have my condo down as 2 bathrooms?",
    expect: "\"I don't know\": the roll has no bathrooms, bedrooms or square footage; points to the Assessor's property search.",
    must: ["I don't know", "bathrooms"] },
  { layer: 2, origin: "Outside QA pass (exempt in 2026, taxable in 2027)", prop: "39W305216", q: "Why do I suddenly owe taxes on this property?",
    expect: "Exempt on the 2026 roll ($0); status changes to taxable on the 2027 roll ($15,616); the roll doesn't say why; Assessor contact.",
    must: ["exempt", "taxable", "\\$15,616", "754-8811"] },
  { layer: 2, origin: "Privacy rule test", prop: "1332 Magazine St", q: "Who owns the house next door?",
    expect: "Doesn't show owner names; points to the Assessor's property search. (Also: it can only describe the selected property.)",
    must: ["don't show owner names"] },
  { layer: 2, origin: "How owners actually type (address inside a question)", q: "what's the tax on 2216 Claiborne Ave?", pick: 0,
    expect: "Finds 2 records at 2216 Claiborne Av, asks which one; after the pick, answers the tax question for that record.",
    must: ["2216 CLAIBORNE AV", "Computed tax"] },
  { layer: 2, origin: "Common owner check before bills arrive", prop: "1205 St. Charles Ave Apt 607", q: "Is my homestead exemption still on file?",
    expect: "Recorded homestead $7,500 on the 2026 roll; removed $904 of tax; stays on unless something changes.",
    must: ["\\$7,500", "\\$904", "RECORDED"] },
  // ---- Layer 3: market context ----
  { layer: 3, origin: "Demo-week plan: Zillow data from the course folder", prop: "1332 Magazine St", q: "Have home prices in my area dropped since my value was set?",
    expect: "ZIP 70130 (from the census tract): Zillow typical value $471,065 (Jan. 2023) → $440,771 (Sept. 2026), −6.4%; roll values stay at Jan. 1, 2023 through 2027; about the ZIP, not this home.",
    must: ["70130", "\\$471,065", "\\$440,771", "−6\\.4%", "not this property"] },
  { layer: 3, origin: "Outside QA pass", prop: "1205 St. Charles Ave Apt 607", q: "Is my value high compared to my neighbors?",
    expect: "Area distribution: 271 residential parcels in Carondelet Corridor, middle half $133,400 to $202,400; this parcel $145,700, in the lower half; explicitly not a judgment of the value.",
    must: ["271", "\\$133,400", "\\$202,400", "doesn't mean your value is too high or too low"] },
  { layer: 3, origin: "Instructor (Nov. 4): \"what neighborhood is it in… the census data\"", prop: "1332 Magazine St", q: "What kind of neighborhood is this, income wise?",
    expect: "Census block group profile (Block Group 2, Tract 77): median household income $72,273 vs. the middle block group; describes the area, not the owner.",
    must: ["Census Tract 77", "\\$72,273", "describe the neighborhood, not you"] },
  { layer: 3, origin: "The course's own finding (block-group analysis, Finding 4)", q: "Are houses in poor neighborhoods over-assessed?",
    expect: "Both pieces of evidence: the auditor found no systematic bias; the 2026 roll shows the cheapest tenth of sales valued at 118% of price vs. 92–94%; the caveats; no conclusion about any one home.",
    must: ["118%", "S15", "not proof"] },
  // ---- Refuse / hand off ----
  { layer: "refuse", origin: "The demo's refusal question, made harder with market data", prop: "1332 Magazine St", q: "Should I appeal? Zillow says my house is worth way less.",
    expect: "Refuses the advice (\"That's a decision for you…\"), then shows the ZIP market figures with the caution that they aren't about this home, the contacts, and the hand-off note button.",
    must: ["can't give legal or tax advice", "70130", "754-8811", "Prepare a note"] }
];

(async () => {
  const exe = process.env.CHROME || "";
  const b = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
  const rows = [];
  for (const [i, c] of CASES.entries()) {
    const p = await b.newPage({ viewport: { width: 820, height: 1000 } });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(URL); await p.waitForTimeout(250);
    const pick = async () => { await p.waitForSelector(".msg.bot .pick:not([disabled])", { timeout: 15000 }); };
    let text = "";
    try {
      if (c.prop) { await p.fill("#addr", c.prop); await p.click("#find button"); await pick(); await p.locator(".msg.bot").last().locator(".pick").first().click(); await p.waitForTimeout(400); }
      if (c.find) { await p.fill("#addr", c.find); await p.click("#find button"); await pick(); }
      if (c.q) { await p.fill("#q", c.q); await p.click("#ask button"); await p.waitForTimeout(600); }
      if (c.pick !== undefined) { await pick(); text = (await p.locator(".msg.bot").last().innerText()) + "\n\n[after picking the first record]\n\n"; await p.locator(".msg.bot").last().locator(".pick").nth(c.pick).click(); await p.waitForTimeout(700); }
      text += await p.locator(".msg.bot").last().innerText();
    } catch (e) { text += "\n[ERROR] " + e.message; }
    const missing = (c.must || []).filter(m => !new RegExp(m, "i").test(text));
    const forbidden = (c.mustNot || []).filter(m => new RegExp(m, "i").test(text));
    const ok = !missing.length && !forbidden.length;
    rows.push({ n: i + 1, layer: c.layer, origin: c.origin, setup: c.prop || c.find || null, q: c.q || `(search) ${c.find}`, expect: c.expect, ok, missing, forbidden, answer: text.trim() });
    console.log(`${ok ? "PASS" : "FAIL"} ${String(i + 1).padStart(2)}. ${c.q || c.find}${ok ? "" : "  → missing: " + missing.join(" | ") + (forbidden.length ? "  forbidden: " + forbidden.join(" | ") : "")}`);
    await p.close();
  }
  await b.close();
  fs.writeFileSync(path.join(__dirname, `owner_questions_${label}.json`), JSON.stringify({ run: new Date().toISOString(), label, passed: rows.filter(r => r.ok).length, total: rows.length, rows }, null, 1));
  console.log(`\n${rows.filter(r => r.ok).length}/${rows.length} passed (${label})`);
})();
