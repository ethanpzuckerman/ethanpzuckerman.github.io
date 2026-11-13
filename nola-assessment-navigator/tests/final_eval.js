// End-to-end test of the full prototype in a real browser: general questions, property lookup, the two layers
// together, guardrails, and the optional AI explanation (with Claude mocked, since it only runs on claude.ai).
// Run from nola-assessment-navigator/ with a server:  python3 -m http.server 8765  then  node tests/final_eval.js
// Optional: node tests/final_eval.js <url> (e.g. file:///…/NOLA Assessment Navigator.html for the single-file copy)
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const URL = process.argv[2] || "http://localhost:8765/index.html";
const SHOTS = path.join(__dirname, "../docs/screenshots/final");

(async () => {
  const exe = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
  const browser = await chromium.launch(require("fs").existsSync(exe) ? { executablePath: exe } : {});
  const results = [];
  const errors = [];

  async function newPage(aiMode) {
    const page = await browser.newPage({ viewport: { width: 900, height: 1100 } });
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
    // Failed requests are reported by URL. The favicon lives in the parent portfolio site, which this server doesn't serve.
    page.on("response", r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(`${r.status()} ${r.url()}`); });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    if (aiMode) {
      // Mock the claude.ai runtime. "good" answers from the prompt's own facts; "bad" invents a number; "deny" refuses.
      await page.addInitScript(mode => {
        const sample = async prompt => {
          if (mode === "deny") { const e = new Error("no"); e.code = "not_granted"; throw e; }
          if (mode === "bad") return { text: "Your tax will be about $9,999,999 next year [S30].", truncated: false };
          const rec = prompt.match(/computed tax (\$[\d,]+) at ([\d.]+) total mills/);
          const text = rec
            ? `Your **recorded** 2026 tax is ${rec[1]} at ${rec[2]} mills [S30].\n- It doesn't include special-district fees [S30].`
            : "Homestead takes **$7,500** off your assessed value, the first $75,000 of market value [S2].";
          return { text, truncated: false };
        };
        window.claude = { use: async name => (name === "sample" ? sample : null) };
      }, aiMode);
    }
    await page.goto(URL, { waitUntil: "load" });
    return page;
  }
  const lastBot = page => page.locator(".msg.bot").last().innerText();
  async function ask(page, q, wait = 350) { await page.fill("#q", q); await page.click("#ask button"); await page.waitForTimeout(wait); return lastBot(page); }
  async function find(page, q) { await page.fill("#addr", q); await page.click("#find button"); await page.waitForSelector(".msg.bot .pick:not([disabled])", { timeout: 15000 }); }
  async function pickFirst(page) { await page.locator(".msg.bot").last().locator(".pick").first().click(); await page.waitForTimeout(400); }
  function check(name, ok, detail) { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  → " + String(detail).slice(0, 300)}`); }

  /* ---------- The in-class demo trio ---------- */
  let p = await newPage();
  let t = await ask(p, "How do I apply for the homestead exemption?");
  check("Demo 1: general question answered with sources and contacts", /\$7,500/.test(t) && /Sources/i.test(t) && /754-8811/.test(t), t);
  await find(p, "1205 St. Charles Ave, Apt 607"); await pickFirst(p);
  t = await lastBot(p);
  check("Demo 2: property lookup finds and shows the record", /1205 ST CHARLES/.test(t) && /\$145,700/.test(t), t);
  t = await ask(p, "How much tax will I pay?");
  check("Demo 2b: tax leads with the next bill (2027 roll) and shows the 2026 tax", /2027 roll \(your next bill[\s\S]*\$1,030[\s\S]*\$1,019/.test(t), t);
  check("Demo 2c: recorded / calculated / explanation labeled, roll-forward shown as a range", /RECORDED/i.test(t) && /CALCULATED/i.test(t) && /4\.039/.test(t), t);
  await p.screenshot({ path: path.join(SHOTS, "demo-2-property-tax.png"), fullPage: false });
  t = await ask(p, "Should I appeal my assessment?");
  check("Demo 3: advice refused, record shown, human contact offered", /can't give legal or tax advice/.test(t) && /754-8811/.test(t), t);

  /* ---------- Bringing the layers together ---------- */
  t = await ask(p, "How do I apply for the homestead exemption?");
  check("General answer + this property's record panel", /Your property: 1205 ST CHARLES/i.test(t) && /\$7,500 is on this parcel/.test(t), t);
  t = await ask(p, "How does my property compare to others in my area?");
  check("Layer 3: area comparison, distribution only", /middle half/i.test(t) && /doesn't mean your value is too high or too low/.test(t), t);
  t = await ask(p, "What neighborhood is it in?");
  check("Neighborhood: census block group profile with the caution", /Block Group/.test(t) && /describe the neighborhood, not you/.test(t), t);
  t = await ask(p, "My SSN is 123-45-6789, what is my value?");
  check("Privacy guard still works with a property selected", /don't share Social Security/.test(t) && !/123-45-6789/.test(t.replace(/^.*?\n/, "")), t);
  await p.click("#clear-prop"); await p.waitForTimeout(200);
  check("Change property hides the selected bar", await p.locator("#selected").isHidden(), "bar visible");
  await p.close();

  p = await newPage();
  t = await ask(p, "What will my 2027 bill be?");
  check("Property question before a lookup: general answer + 'find your property' hint", /Want your own numbers/.test(t), t);
  await find(p, "1332 Magazine St"); await pickFirst(p);
  t = await lastBot(p);
  check("…then it answers that question right after the pick", /1332 MAGAZINE/.test(t) && /2027 roll \(your next bill/.test(t), t);
  await p.close();

  p = await newPage();
  await ask(p, "What's the tax on 2216 Claiborne Ave?", 1200);
  await p.locator(".msg.bot").last().locator(".pick").first().click(); await p.waitForTimeout(600);
  t = await lastBot(p);
  check("Address inside a question: lookup, pick, then the answer", /2216 CLAIBORNE/.test(t) && /Computed tax/.test(t), t);
  await find(p, "1332 Magazine St");
  await p.locator(".msg.bot .pick:not([disabled])").first().waitFor();
  // Click the older list's second record: must select that record, not one from the newest list.
  const older = p.locator('.pick[data-list="0"]').nth(1);
  const olderText = await older.innerText();
  if (await older.isDisabled()) {
    check("Older candidate lists stay tied to their own records", true, "older list already resolved");
  } else {
    await older.click(); await p.waitForTimeout(500);
    const sel = await p.locator("#selected .sel-text").innerText();
    check("Older candidate lists stay tied to their own records", sel.includes(olderText.split("\n")[0].trim()), sel + " vs " + olderText);
  }
  await p.close();

  p = await newPage();
  t = await ask(p, "2027 reassessment");
  check("'2027 reassessment' is a question, not an address", /reappraisal/i.test(t) && !/couldn't find that property/.test(t), t);
  t = await ask(p, "What is the 2027 reassessment?");
  check("2027 reassessment explained: values as of 1/1/2023 cover 2024–2027; next one in 2027 for the 2028 roll", /2024 through 2027/.test(t) && /2028 roll/.test(t), t);
  t = await ask(p, "Can I pay in installments?");
  check("Installments: sourced answer (no formal plan, partial payments)", /doesn't offer a formal installment plan/.test(t) && /S34/.test(t), t);
  t = await ask(p, "Did Amendment 9 pass?");
  check("Nov. 3 amendments: results reported as unofficial", /approved/.test(t) && /unofficial/.test(t), t);
  t = await ask(p, "homstead exemtion how do i get it");
  check("Typos still find the homestead answer", /\$7,500/.test(t), t);
  t = await ask(p, "What's the sales tax rate?");
  check("Out of scope (sales tax): I don't know + contacts", /I don't know/.test(t) && /754-8811/.test(t), t);
  t = await ask(p, "¿Cómo solicito la exención de homestead?");
  check("Spanish: says it answers in English, still helps", /solo puedo responder en inglés/.test(t), t);
  await find(p, "39W305216"); await pickFirst(p);
  t = await ask(p, "Why did my taxes go up?");
  check("Parcel ID with letters works; tax change explained by status, not millage alone", /no longer exempt/.test(t) && !/all of it from the millage/.test(t), t);
  await p.close();

  /* ---------- AI explanation (Claude mocked) ---------- */
  p = await newPage("good");
  await p.waitForTimeout(300);
  check("AI toggle appears when the runtime offers Claude", await p.locator("#ai-bar").isVisible(), "hidden");
  t = await ask(p, "How do I apply for the homestead exemption?", 800);
  check("AI explanation shown on top, full answer kept below", await p.locator(".msg.bot").last().locator(".ai").count() === 1 && /Full answer from the knowledge base/.test(t), t);
  await find(p, "1205 St. Charles Ave, Apt 607"); await pickFirst(p);
  t = await ask(p, "How much tax will I pay?", 800);
  check("AI explanation for a property uses the record's own numbers", /AI explanation/i.test(t) && /\$1,019 at 131\.99 mills/.test(t) && /RECORDED/i.test(t), t);
  await p.screenshot({ path: path.join(SHOTS, "ai-explanation.png"), fullPage: false });
  await p.close();

  p = await newPage("bad");
  await p.waitForTimeout(300);
  await ask(p, "How is my property tax bill calculated?", 800);
  check("AI answer with an invented number is rejected; checked answer shown", await p.locator(".msg.bot").last().locator(".ai").count() === 0 && /3,056/.test(await lastBot(p)), await lastBot(p));
  await p.close();

  p = await newPage("deny");
  await p.waitForTimeout(300);
  await ask(p, "What is a mill?", 800);
  check("Viewer declines AI: answer still shown, toggle hidden", /\$1 of tax per \$1,000/.test(await lastBot(p)) && await p.locator("#ai-bar").isHidden(), await lastBot(p));
  await p.close();

  /* ---------- Phone ---------- */
  p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on("pageerror", e => errors.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto(URL, { waitUntil: "load" });
  await find(p, "1332 Magazine St"); await pickFirst(p);
  await ask(p, "What neighborhood is it in?");
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("Phone: no horizontal scroll", overflow <= 0, overflow + "px");
  await p.screenshot({ path: path.join(SHOTS, "phone-neighborhood.png") });
  await p.close();

  check("No page errors", errors.length === 0, errors.join(" | "));
  await browser.close();
  const passed = results.filter(r => r.ok).length;
  console.log(`\n${passed}/${results.length} passed`);
  require("fs").writeFileSync(path.join(__dirname, "final_eval_results.json"), JSON.stringify({ url: URL, run: new Date().toISOString(), passed, total: results.length, results }, null, 2));
  process.exit(passed === results.length ? 0 : 1);
})();
