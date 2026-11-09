// Print docs/report.html (from pipeline/build_report.py) to the submission PDF with headless Chromium.
// Run from nola-assessment-navigator/:  node pipeline/report_pdf.js
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
(async () => {
  const docs = path.resolve(__dirname, "../docs");
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const p = await b.newPage();
  await p.goto("file://" + path.join(docs, "report.html"), { waitUntil: "load" });
  await p.pdf({
    path: path.join(docs, "NOLA Assessment Navigator - Part 2.pdf"), format: "Letter", printBackground: true,
    margin: { top: "0.6in", bottom: "0.7in", left: "0.6in", right: "0.6in" }, displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: '<div style="font-size:8px;color:#888;width:100%;text-align:center">NOLA Assessment Navigator, Part 2 · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  });
  await b.close();
  console.log("wrote", path.join(docs, "NOLA Assessment Navigator - Part 2.pdf"));
})();
