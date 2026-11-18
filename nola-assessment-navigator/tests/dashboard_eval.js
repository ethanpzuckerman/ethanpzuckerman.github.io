// Property dashboard checks in a real browser: map, charts, neighborhood tile, similar properties, comparison,
// official bill links, collapsed long answers and the two new general answers.
// Server: python3 -m http.server 8765 in this folder. Run: node tests/dashboard_eval.js [url]
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node-tools/node_modules/playwright")); }
const URL = process.argv[2] || "http://localhost:8765/";
(async () => {
  const exe = process.env.CHROME || "";
  const b = await chromium.launch(require("fs").existsSync(exe) ? { executablePath: exe } : {});
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  p.on("pageerror", e => errors.push(e.message));
  let pass = 0, fail = 0;
  const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  → " + String(got).slice(0, 200)}`); };
  const lastBot = () => p.locator(".msg.bot").last().innerText();
  const ask = async q => { await p.fill("#q", q); await p.click("#ask button"); await p.waitForTimeout(600); return lastBot(); };

  await p.goto(URL, { waitUntil: "load" });
  await p.waitForTimeout(500);
  let t = await ask("Do property taxes differ by neighborhood?");
  check("Neighborhood question: same rate, differences from values / homestead / districts", /131\.99/.test(t) && /\$12,559/.test(t) && /S11|S30/.test(t), t);
  t = await ask("Where can I see my official tax bill?");
  check("Official bill question: City Tax Bill Search, cited S42", /taxbills\.nola\.gov/.test(t) && /S42/.test(t), t);

  await p.click(".preview");
  await p.waitForSelector("#dash:not([hidden])", { timeout: 20000 });
  await p.waitForTimeout(3500);
  check("Dashboard opens for the example property", (await p.textContent("#dash-addr")).includes("1205 ST CHARLES"), await p.textContent("#dash-addr"));
  check("Official 2026 bill link points at the City's PDF for this parcel", (await p.getAttribute("#dash-bill", "href")) === "https://taxbills.nola.gov/pdfs/2026/102000079.pdf", await p.getAttribute("#dash-bill", "href"));
  check("Your property panel has the 2026 / 2025 bill links", await p.locator("#prop-body .bills a").count() === 3, await p.locator("#prop-body .bills a").count());
  const hist = await p.locator("#chart-history svg").getAttribute("aria-label");
  check("Tax history chart: 2026 $1,019 and 2027 $1,030", /2026 \$1,019/.test(hist) && /2027 \$1,030/.test(hist), hist);
  const total = await p.locator("#chart-breakdown tfoot").innerText();
  check("Where your tax goes: parts add up to $1,019.49 (recorded $1,019.48)", /1,019\.49/.test(total) && /1,019\.48/.test(await p.locator("#chart-breakdown").innerText()), total);
  const zip = await p.locator("#chart-zip svg").getAttribute("aria-label");
  check("ZIP trend chart for 70130 with Jan. 2023 change", /70130/.test(zip) && /since January 2023/.test(zip), zip);
  const hood = await p.locator("#chart-hood").innerText();
  check("Neighborhood tile: area median $1,938 vs city $2,453", /\$1,938/.test(hood) && /\$2,453/.test(hood), hood);
  const sims = await p.locator(".sim-list li").count();
  check("Similar properties recommended (1–5)", sims >= 1 && sims <= 5, sims);
  check("Map draws (Leaflet) or shows the fallback link", await p.locator("#map .leaflet-container, #map.leaflet-container, #map .map-fallback").count() > 0, await p.locator("#map").innerHTML());
  await p.locator(".sim-list [data-dash=compare]").first().click();
  await p.waitForTimeout(900);
  check("Compare: a recommended property adds a column", await p.locator(".cmp thead th").count() === 3, await p.locator(".cmp thead th").count());
  check("Compare marks only the lowest tax figures", await p.locator('.cmp td[data-best]').count() >= 1 && !(await p.locator("#compare-table").innerText()).match(/\$145,800 ↓/), await p.locator("#compare-table").innerText());
  await p.click("[data-dash=clear-compare]");
  await p.waitForTimeout(400);
  check("Clear comparison empties it", await p.locator(".cmp").count() === 0, await p.locator("#compare-table").innerText());
  t = await ask("How much tax will I pay?");
  const clamped = await p.locator(".msg.bot").last().evaluate(m => m.classList.contains("clamped"));
  check("Long property answer is collapsed with 'Show full answer' (text still present)", clamped && /\$1,019/.test(t), t);
  check("Your property panel shows a mini map and the mini tax chart on lookup", await p.locator("#mini-map.leaflet-container, #mini-map .map-fallback").count() === 1 && await p.locator("#mini-hist svg").count() === 1, await p.locator("#prop-body").innerHTML());
  check("Feature strip and 'See a sample dashboard' are on the home page", await p.locator("#sample-dash").count() === 1 && await p.locator(".feature-list li").count() === 5, "");

  // A parcel the data doesn't place still gets a full dashboard, at an approximate location.
  await p.goto(URL + "#p=513012603", { waitUntil: "load" });
  await p.waitForSelector("#dash:not([hidden])", { timeout: 30000 });
  await p.waitForTimeout(4500);
  const note = await p.textContent("#map-note");
  check("Unlocated parcel: approximate location from the same street, labeled", /Approximate location/.test(note) && /same street/.test(note), note);
  check("Unlocated parcel: ZIP chart and similar properties still shown", await p.locator("#chart-zip svg").count() === 1 && await p.locator(".sim-list li").count() >= 1, await p.locator("#similar").innerText());
  check("No page errors", errors.length === 0, errors.join(" | "));
  console.log(`\n${pass}/${pass + fail} passed`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
