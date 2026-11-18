// Print every docs/build/*.html (from pipeline/build_report.py) to a PDF of the same name in docs/.
// Run from nola-assessment-navigator/:  node pipeline/report_pdf.js
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT || "/opt/node-tools/node_modules/playwright");
(async () => {
  const docs = path.resolve(__dirname, "../docs");
  const build = path.join(docs, "build");
  const b = await chromium.launch(process.env.CHROME && require("fs").existsSync(process.env.CHROME) ? { executablePath: process.env.CHROME } : {});
  for (const f of fs.readdirSync(build).filter(f => f.endsWith(".html"))) {
    const name = f.replace(/\.html$/, "");
    const p = await b.newPage();
    await p.goto("file://" + path.join(build, f), { waitUntil: "load" });
    await p.pdf({
      path: path.join(docs, name + ".pdf"), format: "Letter", printBackground: true,
      margin: { top: "0.6in", bottom: "0.7in", left: "0.6in", right: "0.6in" }, displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="font-size:8px;color:#888;width:100%;text-align:center">${name} · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`
    });
    await p.close();
    console.log("wrote", path.join(docs, name + ".pdf"));
  }
  await b.close();
})();
