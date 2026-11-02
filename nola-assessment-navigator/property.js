/* NOLA Assessment Navigator — answers about one selected property (Layer 2).
   Every answer keeps three things apart (CLAUDE.md §4):
     Recorded    – copied from the 2026 roll, with the field name
     Calculated  – arithmetic the Navigator did on recorded values, with the formula
     Explanation – general rules, cited to the knowledge base sources
   Works in the browser (window.NolaProperty) and in Node (tests). */

(function (root) {
  const ROLL = "2026 roll";

  const n = v => (typeof v === "number" ? v : 0);
  const usd = v => "$" + Math.round(v).toLocaleString("en-US");
  const pct = v => (v * 100).toFixed(1).replace(/\.0$/, "") + "%";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const title = s => esc(String(s || "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));

  function rec(r) {
    // Fill the defaults the export left out to save space. 2027 values are stored only when they differ from 2026.
    const o = Object.assign({ fz: "0", vt: "0", st: "AC", n: 1 }, r, {
      lmv: n(r.lmv), imv: n(r.imv), tmv: n(r.tmv), lav: n(r.lav), iav: n(r.iav), tav: n(r.tav),
      hs: n(r.hs), oe: n(r.oe), ve: n(r.ve), fr: n(r.fr), tx: n(r.tx)
    });
    o.has27 = !r.no27 && typeof r.t27 === "number";
    o.m27 = "m27" in r ? r.m27 : o.tmv;
    o.a27 = "a27" in r ? r.a27 : o.tav;
    o.h27 = "h27" in r ? r.h27 : o.hs;
    o.x27 = "x27" in r ? r.x27 : o.tx;
    o.th26 = n(r.th26); o.th27 = n(r.th27);
    return o;
  }

  // Total mills on the parcel: stored per parcel only when different from the district's usual rate.
  const mills = (r, meta, year) => r["ml" + String(year).slice(2)] || ((meta.mills || {})[year] || {})[r.d] || null;

  const row = (label, value, field) =>
    `<tr><th scope="row">${label}</th><td>${value}</td><td class="field">${field}</td></tr>`;

  function block(kind, inner, labelOverride) {
    const label = labelOverride || { recorded: "Recorded in the " + ROLL, calculated: "Calculated by the Navigator", explanation: "What it means", missing: "Not in this record" }[kind];
    return `<div class="prov prov-${kind}"><span class="prov-tag">${label}</span>${inner}</div>`;
  }

  function sourceLine(meta) {
    return `<p class="srcline">Source: ${esc(meta.source)}. Parcel record as published; values as of ${esc(meta.assessmentDate)}. <a href="${esc(meta.sourceUrl)}" target="_blank" rel="noopener">LTC tax rolls</a></p>`;
  }

  /* The property card shown when an owner confirms a record. */
  function card(r0, meta) {
    const r = rec(r0);
    const exempt = r.st === "EX";
    return `<div class="pcard">
<h3>${esc(r.a)}</h3>
<p class="pmeta">Parcel ${esc(r.id)} · ${title(r.occ)} · District ${esc(r.d)}, Ward ${esc(r.w)}${r.sub ? " · " + title(r.sub) : ""}</p>
${block("recorded", `<table class="ptable">
${row("Market value (land)", usd(r.lmv), "Land Market Value")}
${row("Market value (buildings)", usd(r.imv), "Improvement Market Value")}
${row("Total market value", "<strong>" + usd(r.tmv) + "</strong>", "Total Market Value")}
${row("Assessed value", usd(r.tav), "Total Assessed Value")}
${row("Homestead exemption", r.hs ? usd(r.hs) + (r.hsp && !/^100/.test(r.hsp) ? ` (${esc(r.hsp.replace(/^0+/, ""))}% of ownership)` : "") : "None", "Homestead Exemption Amount")}
${r.ve ? row("Veteran exemption", usd(r.ve), "Veteran Exemption Amount") : ""}
${r.fr ? row("First responder exemption", usd(r.fr), "First Responder Exemption Amount") : ""}
${r.oe ? row("Other exemption", usd(r.oe), "Other Exemption Amount") : ""}
${row("Taxable assessed value", "<strong>" + usd(r.tx) + "</strong>", "Taxable Assessed Value")}
${typeof r.t26 === "number" ? row("Computed tax, 2026 roll", "<strong>" + usd(r.t26) + "</strong>", "LTC millage file (AMILLAGE)") : ""}
${r.has27 ? row("Market value, 2027 roll", usd(r.m27) + (r.m27 === r.tmv ? " (same)" : ` (${r.m27 > r.tmv ? "+" : "−"}${usd(Math.abs(r.m27 - r.tmv))})`), "2027 roll, market value") : ""}
${r.has27 ? row("Computed tax, 2027 roll", usd(r.t27), "2027 roll, LTC millage file") : ""}
${row("Assessment freeze", r.fz === "0" ? "None" : "Yes (code " + esc(r.fz) + ")", "Freeze Code(s)")}
${exempt ? row("Status", "Exempt", "Assessment Status(es)") : ""}
</table>`)}
${sourceLine(meta)}
</div>`;
  }

  /* Short line used in the candidate list so owners can tell records apart. */
  function candidateLine(r0) {
    const r = rec(r0);
    return `<strong>${esc(r.a)}</strong><span>${title(r.occ)} · District ${esc(r.d)}, Ward ${esc(r.w)}${r.sub ? " · " + title(r.sub) : ""} · Market value ${usd(r.tmv)}</span>${r.legal ? `<span class="legal">${esc(r.legal)}</span>` : ""}`;
  }

  // Exempt parcels (government, religious, nonprofit) carry an "other" exemption equal to the full assessed value.
  function exemptNote(r) {
    if (!(r.st === "EX" || (r.oe && r.oe >= r.tav))) return "";
    return `<p>This parcel is <strong>exempt</strong>: an "other" exemption of ${usd(r.oe)} covers its whole assessed value (fields: Assessment Status = EX, Other Exemption Amount). Exempt parcels are usually government, religious or nonprofit property. The roll doesn't say which kind this is.</p>`;
  }

  /* ---------- Questions about the selected property ---------- */
  const INTENTS = [
    { id: "compare", re: /\b(2025|last year|previous year|prior year|change[ds]?|went up|go up|increase[ds]?|decrease[ds]?|went down|compared?)\b/i },
    { id: "tax", re: /\b(tax(es)? (bill|owe|due|amount|estimate)|how much (tax|will i (pay|owe))|estimate|my (tax )?bill|property tax(es)?\b.*\b(how much|estimate)|millage|mills)/i },
    { id: "taxable", re: /\btaxable\b|\bwhy (is|are) my (tax(es)?|taxable).*\b(zero|0|nothing)\b/i },
    { id: "homestead", re: /\bhomestead\b/i },
    { id: "freeze", re: /\b(freeze|frozen|special assessment|sal)\b/i },
    { id: "veteran", re: /\b(veteran|first responder|other exemption|exempt(ion|ions)?)\b/i },
    { id: "assessed", re: /\bassess(ed|ment)\b.*\b(value|amount|number)?|\b10 ?%|\bratio\b/i },
    { id: "value", re: /\b(market value|worth|value[ds]?|apprais)/i },
    { id: "building", re: /\b(square (feet|footage)|sq\.? ?ft|bed(room)?s?|bath(room)?s?|condition|size|how big)\b/i },
    { id: "built", re: /\b(year built|when (was it|was my house|was this) built|how old)\b/i },
    { id: "sale", re: /\b(sale|sold|bought|purchase|transfer)\b/i },
    { id: "owner", re: /\b(owner|who owns|my name|owner'?s name)\b/i },
    { id: "type", re: /\b(district|ward|occupancy|type of property|property type|zoned|zoning|classif)/i },
    { id: "right", re: /\b(wrong|incorrect|mistake|error|too high|not right|isn'?t right)\b/i }
  ];

  function intentOf(q) {
    const hit = INTENTS.find(i => i.re.test(q));
    return hit ? hit.id : null;
  }

  function answer(r0, question, meta) {
    const r = rec(r0);
    const intent = intentOf(question);
    if (!intent) return null;
    const head = `<h3>${esc(r.a)} <span class="pid">parcel ${esc(r.id)}</span></h3>`;
    const src = sourceLine(meta);
    const out = parts => ({ intent, html: head + parts.join("") + src, contact: ["right", "compare", "freeze", "owner"].includes(intent) });

    switch (intent) {
      case "value":
        return out([
          block("recorded", `<p>Total market value: <strong>${usd(r.tmv)}</strong> (land ${usd(r.lmv)} + buildings ${usd(r.imv)}). Fields: Total, Land and Improvement Market Value.</p>`),
          block("explanation", `<p>This is the Assessor's mass-appraisal estimate of what the property would sell for, not an appraisal of your specific house <cite>S10</cite>. It's the value as of ${esc(meta.assessmentDate)}, carried into the ${ROLL}. The 2027 roll has new reappraised values that aren't in this file <cite>S4</cite>.</p>`)
        ]);
      case "assessed": {
        const ratio = r.tmv ? r.tav / r.tmv : 0;
        const expected = /COMMERCIAL/.test(r.occ) ? "10% for land and 15% for commercial buildings" : "10%";
        return out([
          block("recorded", `<p>Assessed value: <strong>${usd(r.tav)}</strong> (land ${usd(r.lav)} + buildings ${usd(r.iav)}). Field: Total Assessed Value.</p>`),
          block("calculated", `<p>${usd(r.tav)} ÷ ${usd(r.tmv)} market value = <strong>${pct(ratio)}</strong>.</p>`),
          block("explanation", `<p>Louisiana assesses property at a fixed share of market value: ${expected} for this kind of property <cite>S1</cite>. ${r.fz !== "0" ? "Your record shows an assessment freeze, which is why the ratio can be below 10% <cite>S7</cite>." : Math.abs(ratio - 0.1) < 0.0015 || /COMMERCIAL/.test(r.occ) ? "Your ratio matches that rule." : "Your ratio doesn't match the usual rule, and I don't know why. Ask the Assessor's Office."}</p>`)
        ]);
      }
      case "taxable":
        return out([
          block("recorded", `<p>Taxable assessed value: <strong>${usd(r.tx)}</strong>. Field: Taxable Assessed Value.</p>${exemptNote(r)}`),
          block("calculated", `<p>${usd(r.tav)} assessed − ${usd(r.hs)} homestead − ${usd(r.ve)} veteran − ${usd(r.fr)} first responder − ${usd(r.oe)} other = ${usd(Math.max(0, r.tav - r.hs - r.ve - r.fr - r.oe))} (never below $0). This matches the recorded value.</p>`),
          r.tx === 0 && r.t26 > 0 ? block("recorded", `<p>Even so, the roll computes <strong>${usd(r.t26)}</strong> in 2026 tax on this parcel. That's the police and fire millages "without homestead exemption" (11.51 mills), which still apply to the exempted value: ${usd(r.tav)} × 11.51 ÷ 1,000 = ${usd(r.tav * 11.51 / 1000)} <cite>S30</cite>.</p>`) : "",
          block("explanation", `<p>Most millages are applied to the taxable value <cite>S11</cite>. ${r.tx === 0 ? "A taxable value of $0 means your exemptions cover the whole assessed value for those millages. The police and fire millages without homestead exemption are the exception <cite>S30</cite>." : ""}</p>`)
        ]);
      case "tax": {
        if (typeof r.t26 !== "number") {
          return out([block("missing", `<p><strong>I don't know.</strong> No computed tax is recorded for this parcel in the roll's millage file. Your bill comes from the Bureau of the Treasury <cite>S27</cite>.</p>`)]);
        }
        const ml = mills(r, meta, 2026);
        const gross = r.tav * ml / 1000;
        return out([
          block("recorded", `<p>Computed property tax on the 2026 roll: <strong>${usd(r.t26)}</strong>${ml ? `, from ${ml.toFixed(2)} total mills` : ""}${r.th26 ? `, after a homestead reduction of ${usd(r.th26)}` : ""}. Taxable assessed value: ${usd(r.tx)}. Source: the LTC roll's millage file, which lists every levy on the parcel.</p>${exemptNote(r)}`
            + (r.has27 ? `<p>On the 2027 roll: <strong>${usd(r.t27)}</strong>${mills(r, meta, 2027) ? ` at ${mills(r, meta, 2027).toFixed(2)} mills` : ""}.</p>` : "")),
          ml && r.tav ? block("calculated", `<p>Check: ${usd(r.tav)} assessed × ${ml.toFixed(2)} mills ÷ 1,000 = ${usd(gross)} before homestead${r.th26 ? `, − ${usd(r.th26)} homestead reduction = ${usd(gross - r.th26)}` : ""}${r.oe || r.ve || r.fr ? " (other exemptions reduce it further)" : ""}. Matches the recorded amount${Math.abs(gross - r.th26 - r.t26) > 2 && !(r.oe || r.ve || r.fr) ? " only roughly" : ""}.</p>`) : "",
          block("explanation", `<p>Homestead reduces every levy except the police and fire millages "without homestead exemption" (11.51 mills), so homesteaded owners still pay those on the first $7,500 <cite>S30</cite>. This total <strong>doesn't include special-district fees</strong> such as the Downtown Development District or neighborhood security districts, which are billed separately <cite>S17</cite>. Your actual bill and due date come from the Bureau of the Treasury <cite>S27</cite>.</p>`)
        ]);
      }
      case "homestead":
        return out([
          block("recorded", r.hs
            ? `<p>Homestead exemption: <strong>${usd(r.hs)}</strong> of assessed value${r.hsp && !/^100/.test(r.hsp) ? `, covering ${esc(r.hsp.replace(/^0+/, ""))}% of the ownership` : ""}. Field: Homestead Exemption Amount.</p>`
            : `<p>No homestead exemption is recorded on this parcel. Field: Homestead Exemption = No.</p>`),
          r.hs && r.th26 ? block("recorded", `<p>Taxes the exemption removed on the 2026 roll: <strong>${usd(r.th26)}</strong> a year (homestead reduction in the LTC millage file). Homestead doesn't reduce the police and fire "without homestead" millages <cite>S30</cite>.</p>`) : "",
          block("explanation", r.hs
            ? `<p>The full exemption is $7,500 of assessed value, the first $75,000 of market value <cite>S2</cite>. Once granted, it stays on; you don't reapply each year <cite>S8</cite>.${r.hs < 7500 ? " Yours is less than $7,500, usually because only part of the ownership qualifies, or the assessed value is below $7,500." : ""}</p>`
            : `<p>If you own this home and live in it as your primary residence, you can apply in person at the Assessor's Office <cite>S7</cite><cite>S8</cite>. Ask me "How do I apply for the homestead exemption?" for the documents to bring.</p>`)
        ]);
      case "freeze":
        return out([
          block("recorded", r.fz === "0"
            ? `<p>No assessment freeze is recorded. Field: Freeze Code(s) = 0.</p>`
            : `<p>This parcel has an assessment freeze (Special Assessment Level), code <strong>${esc(r.fz)}</strong>. Field: Freeze Code(s).</p>`),
          block("explanation", r.fz === "0"
            ? `<p>Owners 65+, permanently disabled owners, and veterans with a 50%+ rating who have homestead and meet the income limit can freeze their assessed value <cite>S1</cite><cite>S24</cite>.</p>`
            : `<p>The freeze locks the assessed value, not the tax bill; millage changes still apply <cite>S24</cite>. <strong>I don't know</strong> what code ${esc(r.fz)} means (age, disability, or veteran). The roll's code table isn't published with this file, so ask the Assessor's Office.</p>`)
        ]);
      case "veteran": {
        const list = [r.ve && `veteran ${usd(r.ve)}`, r.fr && `first responder ${usd(r.fr)}`, r.oe && `other ${usd(r.oe)}`].filter(Boolean);
        return out([
          block("recorded", list.length ? `<p>Exemptions besides homestead: <strong>${list.join(", ")}</strong> of assessed value. Fields: Veteran / First Responder / Other Exemption Amount.</p>` : `<p>No veteran, first responder, or other exemption is recorded on this parcel.</p>`),
          block("explanation", `<p>Disabled veterans with a 50%+ rating can get an extra exemption, and 100% disabled veterans a full exemption <cite>S25</cite><cite>S7</cite>. First responders can get about $2,500 of assessed value off <cite>S7</cite>. "Other" exemptions usually mean government, religious or nonprofit property.</p>`)
        ]);
      }
      case "compare": {
        if (!r.has27) {
          return out([block("missing", `<p><strong>I don't know.</strong> This parcel ID isn't in the 2027 roll; it may have been split, merged or renumbered. The 2025 roll isn't available to me at all. Ask the Assessor's Office.</p>`)]);
        }
        const dm = r.m27 - r.tmv, dt = r.t27 - (r.t26 || 0);
        const m26 = mills(r, meta, 2026), m27 = mills(r, meta, 2027);
        return out([
          block("recorded", `<table class="ptable">
${row("Market value", `${usd(r.tmv)} → ${usd(r.m27)}`, "2026 → 2027 roll")}
${row("Taxable assessed value", `${usd(r.tx)} → ${usd(r.x27)}`, "2026 → 2027 roll")}
${m26 && m27 ? row("Total mills", `${m26.toFixed(2)} → ${m27.toFixed(2)}`, "LTC millage files") : ""}
${row("Computed tax", `${usd(r.t26 || 0)} → ${usd(r.t27)}`, "LTC millage files")}
</table>`, "Recorded in the 2026 and 2027 rolls"),
          block("calculated", `<p>Market value ${dm === 0 ? "<strong>didn't change</strong>" : `changed by <strong>${dm > 0 ? "+" : "−"}${usd(Math.abs(dm))}</strong> (${dm > 0 ? "+" : "−"}${pct(Math.abs(dm) / (r.tmv || 1))})`}. Computed tax changed by <strong>${dt >= 0 ? "+" : "−"}${usd(Math.abs(dt))}</strong>${dm === 0 && dt !== 0 ? ", all of it from the millage change" : ""}.${dm > 0 && r.x27 === r.tx && r.fz !== "0" ? " Taxable value stayed the same because of the assessment freeze on this parcel, so the tax change comes from the millage." : ""}</p>`),
          block("explanation", `<p>Compared by parcel ID ${esc(r.id)}. The 2027 roll the Assessor filed with the state on Sept. 4, 2026 keeps 98% of parcel values the same as 2026, and still dates them 01/01/2023 <cite>S31</cite>. So the expected 2027 reappraisal doesn't show up in it, and <strong>I don't know why</strong>. Ask the Assessor's Office. I can't compare with 2025: that roll isn't available to me.</p>`)
        ]);
      }
      case "building":
        return out([block("missing", `<p><strong>I don't know.</strong> This roll doesn't include square footage, bedrooms, bathrooms or condition: those fields are blank or zero for every parcel. The Assessor's property search may show them, and wrong building details are one of the easiest things to get corrected <cite>S10</cite>.</p>`)]);
      case "built":
        return out([r.yb
          ? block("recorded", `<p>Year built: <strong>${esc(r.yb)}</strong>. Field: Year(s) Built. Treat it as approximate; most recorded years are rounded to the nearest 5 or 10.</p>`)
          : block("missing", `<p><strong>I don't know.</strong> No usable year built is recorded. For non-residential parcels the roll shows 1994 as a placeholder, so I hide it.</p>`)]);
      case "sale":
        return out([r.td
          ? block("recorded", `<p>Last recorded transfer: <strong>${esc(r.td)}</strong>${r.it ? `, document type ${esc(r.it)}` : ""}. Fields: Transfer Date(s), Instrument Type(s).</p>`)
          : block("missing", `<p>No usable transfer date is recorded. The roll uses 12/31/1994 as a placeholder for older transfers.</p>`),
          block("missing", `<p>I don't show sale prices. In this roll they're often $0 or a nominal amount and none are marked verified, so they'd mislead.</p>`)]);
      case "owner":
        return out([block("missing", `<p>I don't show owner names or mailing addresses. The roll has them, but this prototype leaves them out for privacy. The Assessor's property search shows the owner of record.</p>`)]);
      case "type":
        return out([block("recorded", `<p>${title(r.occ)} property in Municipal District ${esc(r.d)}, Ward ${esc(r.w)}${r.sub ? `, area "${title(r.sub)}"` : ""}. Fields: Occupancy Type, Municipal District, Ward, Subdivision.</p>`),
          block("missing", `<p>Zoning isn't in this roll; it comes from the City's zoning map, not the Assessor.</p>`)]);
      case "right":
        return out([block("recorded", `<p>Recorded market value <strong>${usd(r.tmv)}</strong>, assessed <strong>${usd(r.tav)}</strong>, taxable <strong>${usd(r.tx)}</strong>.</p>`),
          block("explanation", `<p>I can't tell you whether your value is wrong; that's a judgment for you and the Assessor. If you think it's too high, the path is an informal review with the Assessor, then the Board of Review <cite>S4</cite><cite>S6</cite>. Ask me "How do I appeal?" for the steps and deadline status.</p>`)]);
    }
    return null;
  }

  const api = { card, candidateLine, answer, intentOf };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NolaProperty = api;
})(typeof window !== "undefined" ? window : this);
