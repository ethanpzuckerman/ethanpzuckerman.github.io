/* NOLA Assessment Navigator — answers about one selected property (Layer 2).
   Every answer keeps three things apart (CLAUDE.md §4):
     Recorded    – copied from the 2026 roll, with the field name
     Calculated  – arithmetic the Navigator did on recorded values, with the formula
     Explanation – general rules, cited to the knowledge base sources
   Works in the browser (window.NolaProperty) and in Node (tests). */

(function (root) {
  // Approximate 2026 combined East Bank rate. Unverified (see docs/verification-checklist.md item 1).
  const MILLAGE_2026 = 121.20;
  const ROLL = "2026 roll";

  const n = v => (typeof v === "number" ? v : 0);
  const usd = v => "$" + Math.round(v).toLocaleString("en-US");
  const pct = v => (v * 100).toFixed(1).replace(/\.0$/, "") + "%";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const title = s => esc(String(s || "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));

  function rec(r) {
    // Fill the defaults the export left out to save space.
    return Object.assign({ fz: "0", vt: "0", st: "AC", n: 1 }, r, {
      lmv: n(r.lmv), imv: n(r.imv), tmv: n(r.tmv), lav: n(r.lav), iav: n(r.iav), tav: n(r.tav),
      hs: n(r.hs), oe: n(r.oe), ve: n(r.ve), fr: n(r.fr), tx: n(r.tx)
    });
  }

  const row = (label, value, field) =>
    `<tr><th scope="row">${label}</th><td>${value}</td><td class="field">${field}</td></tr>`;

  function block(kind, inner) {
    const label = { recorded: "Recorded in the " + ROLL, calculated: "Calculated by the Navigator", explanation: "What it means", missing: "Not in this record" }[kind];
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
    { id: "tax", re: /\b(tax(es)? (bill|owe|due|amount|estimate)|how much (tax|will i (pay|owe))|estimate|my (tax )?bill|property tax(es)?\b.*\b(how much|estimate))/i },
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
          block("explanation", `<p>Millage is applied to the taxable value <cite>S11</cite>. ${r.tx === 0 ? "A taxable value of $0 means your exemptions cover the whole assessed value, so the parish millages in this calculation don't apply. Some charges, like certain police and fire millages, aren't covered by homestead, so check your actual bill <cite>S19</cite>." : ""}</p>`)
        ]);
      case "tax": {
        const est = r.tx * MILLAGE_2026 / 1000;
        return out([
          block("recorded", `<p>Taxable assessed value: <strong>${usd(r.tx)}</strong>. Field: Taxable Assessed Value.</p>${exemptNote(r)}`),
          block("calculated", `<p>${usd(r.tx)} × ${MILLAGE_2026.toFixed(2)} mills ÷ 1,000 ≈ <strong>${usd(est)}</strong> a year. <em>Rough estimate, not your bill.</em></p>`),
          block("explanation", `<p>The ~${MILLAGE_2026.toFixed(2)}-mill combined rate is approximate and not yet verified against the Treasury's millage table <cite>S11</cite>. ${r.hs ? "Some millages (certain police and fire taxes) aren't reduced by homestead, so a homesteaded bill is usually a bit higher than this <cite>S19</cite>. " : ""}Special districts like the Downtown Development District or a security district add more, and this roll doesn't say which ones apply to your parcel <cite>S17</cite>. Your actual bill comes from the Bureau of the Treasury <cite>S27</cite>.</p>`)
        ]);
      }
      case "homestead":
        return out([
          block("recorded", r.hs
            ? `<p>Homestead exemption: <strong>${usd(r.hs)}</strong> of assessed value${r.hsp && !/^100/.test(r.hsp) ? `, covering ${esc(r.hsp.replace(/^0+/, ""))}% of the ownership` : ""}. Field: Homestead Exemption Amount.</p>`
            : `<p>No homestead exemption is recorded on this parcel. Field: Homestead Exemption = No.</p>`),
          r.hs ? block("calculated", `<p>${usd(r.hs)} × ~${MILLAGE_2026.toFixed(2)} mills ÷ 1,000 ≈ <strong>${usd(r.hs * MILLAGE_2026 / 1000)}</strong> a year in taxes the exemption removes (rough estimate; homestead doesn't reduce every millage <cite>S19</cite>).</p>`) : "",
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
      case "compare":
        return out([
          block("missing", `<p><strong>I don't know yet.</strong> Only the ${ROLL} is loaded, so I can't compare this parcel with 2025. When the 2025 roll is added, I'll match it by parcel ID (${esc(r.id)}), which stays the same across years.</p>`),
          block("explanation", `<p>The 2025 and 2026 rolls both carry values from the 2024 reappraisal, so most parcels change little between them. Big changes usually come from a sale, a renovation, a demolition or a correction. The bigger change is the <strong>2027 roll</strong>, a reappraisal year <cite>S4</cite>. Check your 2027 value on the Assessor's site.</p>`)
        ]);
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

  const api = { card, candidateLine, answer, intentOf, MILLAGE_2026 };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NolaProperty = api;
})(typeof window !== "undefined" ? window : this);
