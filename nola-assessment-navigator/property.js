/* NOLA Assessment Navigator — answers about one selected property (Layers 2 and 3).
   Every answer keeps three things apart (CLAUDE.md §4 rule 8):
     Recorded    – copied from the roll, with the field name
     Calculated  – arithmetic the Navigator did on recorded values, with the formula
     Explanation – general rules, cited to the knowledge base sources
   Works in the browser (window.NolaProperty) and in Node (tests). */

(function (root) {
  const ROLL = "2026 roll";
  // Mills the City Council added on Nov. 5, 2026 (partial roll-forward), after the 2027 state file was filed [S33].
  const ROLL_FORWARD_2027 = 4.039;
  const NO_HS_MILLS = 11.51; // police + fire "without homestead exemption" levies, both rolls [S30][S31]

  const n = v => (typeof v === "number" ? v : 0);
  const usd = v => (Math.round(v) < 0 ? "−$" : "$") + Math.abs(Math.round(v)).toLocaleString("en-US");
  const sgn = v => (Math.round(v) === 0 ? "$0" : (v > 0 ? "+" : "−") + usd(Math.abs(v)));
  const pct = v => (v * 100).toFixed(1).replace(/\.0$/, "") + "%";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const title = s => esc(String(s || "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));
  const plain = s => String(s).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

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
    o.st27 = r.st27 || o.st;
    o.td27 = r.td27 || o.td || null;
    o.th26 = n(r.th26); o.th27 = n(r.th27);
    return o;
  }

  // Multi-record parcels list several types ("VACANT LAND | RESIDENTIAL"); pipeline/area_stats.py groups by the first.
  const occKey = r => String(r.occ || "UNKNOWN").split("|")[0].trim();
  // A parcel with $0 market and assessed value has no usable value in this file (a placeholder, not a fact).
  const noValue = r => r.tmv === 0 && r.tav === 0;
  const isExempt = r => r.st === "EX" || (r.tav > 0 && r.oe >= r.tav);

  // Total mills on the parcel: stored per parcel only when different from the district's usual rate.
  const mills = (r, meta, year) => r["ml" + String(year).slice(2)] || ((meta.mills || {})[year] || {})[r.d] || null;

  // Bills are due early in the roll's year (Jan.–Feb.), so from March on the next bill is next year's roll.
  function nextRoll(meta) {
    const now = (meta && meta.now) || new Date();
    return now.getMonth() >= 2 ? now.getFullYear() + 1 : now.getFullYear();
  }

  const row = (label, value, field) =>
    `<tr><th scope="row">${label}</th><td>${value}</td><td class="field">${field}</td></tr>`;

  function block(kind, inner, labelOverride) {
    const label = labelOverride || { recorded: "Recorded in the " + ROLL, calculated: "Calculated by the Navigator", explanation: "What it means", missing: "Not in this record" }[kind];
    return `<div class="prov prov-${kind}"><span class="prov-tag">${label}</span>${inner}</div>`;
  }

  function sourceLine(meta, with27) {
    return `<p class="srcline">Source: ${esc(meta.source)}${with27 && meta.source2027 ? `; 2027 figures: ${esc(meta.source2027)}` : ""}. Parcel record as published; values as of ${esc(meta.assessmentDate)}. <a href="${esc(meta.sourceUrl)}" target="_blank" rel="noopener">LTC tax rolls</a></p>`;
  }

  /* The property card shown when an owner confirms a record. */
  function card(r0, meta) {
    const r = rec(r0);
    const hs27 = r.has27 && r.h27 !== r.hs;
    return `<div class="pcard">
<h3>${esc(r.a)}</h3>
<p class="pmeta">Parcel ${esc(r.id)} · ${title(r.occ)} · District ${esc(r.d)}, Ward ${esc(r.w)}${r.sub ? " · " + title(r.sub) : ""}</p>
${noValue(r) ? `<p class="hint"><strong>This record shows $0 market and assessed value.</strong> That usually means no value is set in this file, so I treat it as missing, not as a real $0.</p>` : ""}
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
${r.has27 ? row("Market value, 2027 roll", usd(r.m27) + (r.m27 === r.tmv ? " (same)" : ` (${sgn(r.m27 - r.tmv)})`), "2027 roll, market value") : ""}
${hs27 ? row("Homestead, 2027 roll", r.h27 ? usd(r.h27) : "<strong>None</strong> (removed)", "2027 roll, homestead") : ""}
${r.has27 && r.st27 !== r.st ? row("Status, 2027 roll", r.st27 === "EX" ? "Exempt" : "Taxable (no longer exempt)", "2027 roll, status") : ""}
${r.has27 ? row("Computed tax, 2027 roll", usd(r.t27) + " (filed before the Nov. 5 roll-forward)", "2027 roll, LTC millage file") : ""}
${row("Assessment freeze", r.fz === "0" ? "None" : "Yes (code " + esc(r.fz) + ")", "Freeze Code(s)")}
${r.st === "EX" ? row("Status", "Exempt", "Assessment Status(es)") : ""}
</table>`)}
${sourceLine(meta, r.has27)}
</div>`;
  }

  /* Short line used in the candidate list so owners can tell records apart. */
  function candidateLine(r0) {
    const r = rec(r0);
    return `<strong>${esc(r.a)}</strong><span>${title(r.occ)} · District ${esc(r.d)}, Ward ${esc(r.w)}${r.sub ? " · " + title(r.sub) : ""} · Market value ${usd(r.tmv)} · Parcel ${esc(r.id)}</span>${r.legal ? `<span class="legal">${esc(r.legal)}</span>` : ""}`;
  }

  // Exempt parcels (government, religious, nonprofit) carry an "other" exemption equal to the full assessed value.
  function exemptNote(r) {
    let s = "";
    if (isExempt(r)) s += `<p>This parcel is <strong>exempt</strong>: an "other" exemption of ${usd(r.oe)} covers its whole assessed value (fields: Assessment Status = EX, Other Exemption Amount). Exempt parcels are usually government, religious or nonprofit property. The roll doesn't say which kind this is.</p>`;
    if (r.has27 && r.st27 !== r.st) s += `<p>On the 2027 roll its status changes to <strong>${r.st27 === "EX" ? "exempt" : "taxable"}</strong>, which is why its 2027 tax is ${usd(r.t27)} <cite>S31</cite>. The roll doesn't say why.</p>`;
    return s;
  }

  // Which assessment ratio rule the recorded assessed value follows (Louisiana Const. Art. VII §18 [S1]).
  function ratioRule(r) {
    const near = (a, b) => Math.abs(a - b) <= Math.max(10, 0.003 * Math.max(a, b));
    if (near(r.tav, 0.1 * r.tmv)) return "10";
    if (near(r.tav, 0.1 * r.lmv + 0.15 * r.imv)) return "10/15";
    if (r.fz !== "0") return "freeze";
    return null;
  }

  // Re-derive the recorded 2026 tax from assessed value and mills, and only say "matches" when it does.
  function taxCheck(r, ml) {
    if (!ml || !r.tav) return "";
    if (isExempt(r)) {
      return block("calculated", `<p>Exemptions remove the whole ${usd(r.tav)} assessed value from every levy, so the computed tax is $0${r.t26 ? `; the roll still records ${usd(r.t26)}, and I don't know why` : ", as recorded"}.</p>`);
    }
    const gross = r.tav * ml / 1000;
    const net = gross - r.th26;
    const other = r.oe || r.ve || r.fr;
    const steps = `${usd(r.tav)} assessed × ${ml.toFixed(2)} mills ÷ 1,000 = ${usd(gross)}${r.th26 ? `, − ${usd(r.th26)} homestead reduction = ${usd(net)}` : ""}`;
    if (other) {
      return block("calculated", `<p>${steps} before the ${[r.ve && "veteran", r.fr && "first responder", r.oe && "other"].filter(Boolean).join(" and ")} exemption, which brings it down to the recorded ${usd(r.t26)}.</p>`);
    }
    const ok = Math.abs(net - r.t26) <= 2;
    return block("calculated", `<p>Check: ${steps}. ${ok ? "Matches the recorded amount." : `That differs from the recorded ${usd(r.t26)}, and I don't know why; ask the Assessor's Office.`}</p>`);
  }

  // The 2027 file predates the Council's Nov. 5, 2026 roll-forward. Show the possible effect as a range, not a guess.
  function rollForward(r) {
    if (!r.has27 || r.st27 === "EX" || r.a27 <= 0) return "";
    const lo = ROLL_FORWARD_2027 * r.x27 / 1000, hi = ROLL_FORWARD_2027 * r.a27 / 1000;
    const range = Math.round(lo) === Math.round(hi) ? `about ${usd(hi)}` : `about ${usd(lo)} to ${usd(hi)}`;
    return block("calculated", `<p>The 2027 file was filed Sept. 4, 2026, <strong>before</strong> the City Council approved a partial roll-forward of ${ROLL_FORWARD_2027} mills on Nov. 5, 2026 <cite>S33</cite>. If those mills are added on top, this bill would rise by ${range} a year (${ROLL_FORWARD_2027} × ${usd(r.x27)} taxable${Math.round(lo) !== Math.round(hi) ? ` to × ${usd(r.a27)} assessed, depending on how much homestead reduces them` : ""} ÷ 1,000). I don't know the final rates, so treat this as a range, not your bill.</p>`);
  }

  /* ---------- Layer 3: market context (distributions only, CLAUDE.md §3 data rule 6) ---------- */
  const PLURAL = { RESIDENTIAL: "residential parcels", "VACANT LAND": "vacant lots", COMMERCIAL: "commercial parcels", EXEMPT: "exempt parcels" };

  function areaGroup(r, areas) {
    if (!areas) return null;
    const occ = occKey(r);
    const tries = [
      ["sub", `${r.d}|${r.sub}|${occ}`, `the "${title(r.sub)}" area of District ${esc(r.d)}`],
      ["ward", `${r.d}|${r.w}|${occ}`, `Ward ${esc(r.w)} of District ${esc(r.d)}`],
      ["city", occ, "all of New Orleans"]
    ];
    for (const [level, key, label] of tries) {
      const g = (areas[level] || {})[key];
      if (g && g.mv) return { level, label, g, kind: PLURAL[occ] || "parcels of this type" };
    }
    return null;
  }

  // Where a value falls among the group's 10/25/50/75/90th percentiles.
  function position(v, q) {
    if (v < q[0]) return "lower than about 90% of them";
    if (v < q[1]) return "between the lowest 10% and lowest 25%";
    if (v < q[2]) return "in the lower half, below the middle value";
    if (v === q[2]) return "right at the middle value";
    if (v <= q[3]) return "in the upper half, above the middle value";
    if (v <= q[4]) return "between the top 25% and top 10%";
    return "higher than about 90% of them";
  }

  function areaAnswer(r, meta) {
    const a = areaGroup(r, meta.areas);
    if (!a) return [block("missing", `<p><strong>I don't know.</strong> I don't have area figures for this parcel. The Assessor's property search shows nearby values.</p>`)];
    const g = a.g, q = g.mv;
    const dt = typeof r.t26 === "number" && r.has27 ? r.t27 - r.t26 : null;
    return [
      block("calculated", `<p>Compared with the <strong>${g.n.toLocaleString("en-US")} ${a.kind}</strong> in ${a.label}${a.level !== "sub" ? " (the roll's area for this parcel has too few similar parcels to compare)" : ""}:</p>
<table class="ptable">
${row("Market value, middle half", `${usd(q[1])} to ${usd(q[3])} (middle value ${usd(q[2])})`, "Total Market Value, 2026 roll")}
${row("This parcel", noValue(r) ? "$0 recorded (no value set)" : `<strong>${usd(r.tmv)}</strong>: ${position(r.tmv, q)}`, "Total Market Value")}
${row("Share with a homestead exemption", pct(g.hs), "Homestead Exemption Amount")}
${row("Share with an assessment freeze", pct(g.fz), "Freeze Code(s)")}
${g.t26 != null ? row("Middle computed tax", `${usd(g.t26)} (2026) → ${usd(g.t27)} (2027)`, "LTC millage files") : ""}
${typeof r.t26 === "number" ? row("This parcel's computed tax", `${usd(r.t26)}${r.has27 ? ` → ${usd(r.t27)}` : ""}`, "LTC millage files") : ""}
${g.chg != null ? row("Market value changed on the 2027 roll", `${pct(g.chg)} of these parcels; this one ${r.has27 ? (r.m27 === r.tmv ? "didn't change" : "did") : "isn't in the 2027 roll"}`, "2026 vs 2027 roll, by parcel ID") : ""}
${g.dt != null && dt != null ? row("Tax change, 2026 → 2027", `middle ${sgn(g.dt)}; this parcel ${sgn(dt)}`, "LTC millage files") : ""}
</table>`, "Calculated by the Navigator from the 2026 and 2027 rolls"),
      block("explanation", `<p>This only describes how values are spread in the area. It <strong>doesn't mean your value is too high or too low</strong>: parcels differ in size, condition, lot and use, and this roll doesn't include building size, so I can't compare like with like. "Area" here is the roll's Subdivision field, which isn't the same as the Assessor's 393 valuation neighborhoods <cite>S15</cite>. Values are from the 2026 roll <cite>S30</cite>; the 2027 figures are from the roll filed with the state <cite>S31</cite>.</p>`)
    ];
  }

  /* ---------- Where it is: census block group (ACS), CLAUDE.md §3 data rule 7 ---------- */
  const money = v => (typeof v === "number" ? usd(v) : "not reported");
  const share = v => (typeof v === "number" ? v.toFixed(1).replace(/\.0$/, "") + "%" : "not reported");
  const num = v => (typeof v === "number" ? v.toLocaleString("en-US") : "not reported");

  function placeAnswer(r, meta) {
    const where = block("recorded", `<p>Roll location: Municipal District ${esc(r.d)}, Ward ${esc(r.w)}${r.sub ? `, area "${title(r.sub)}"` : ""} (fields: Municipal District, Ward, Subdivision).${typeof r.lat === "number" ? ` <a href="https://www.openstreetmap.org/?mlat=${r.lat}&amp;mlon=${r.lon}#map=18/${r.lat}/${r.lon}" target="_blank" rel="noopener">See it on a map</a>${r.ge ? " (approximate spot)" : ""} <cite>S38</cite>.` : ""}</p>`);
    const B = meta.bg && r.bg ? meta.bg.bg[r.bg] : null;
    if (!B) {
      return [where, block("missing", `<p><strong>I don't know</strong> this parcel's census neighborhood. ${r.bg ? "Its block group has no census profile in my data." : "The Census geocoder couldn't match this address to a block group (about 14% of parcels weren't matched)."} The roll itself doesn't record coordinates or census areas.</p>`)];
    }
    const M = meta.bg.middle || {};
    const line = (label, v, m, f) => row(label, f(v), `middle block group: ${f(m)}`);
    return [where,
      block("recorded", `<p>Census area: <strong>${esc(B.name)}</strong> (block group ${esc(r.bg)}), matched from the roll address by the Census geocoder${r.ge ? " (approximate match)" : ""} <cite>S38</cite>. What the American Community Survey says about the people and homes there <cite>S39</cite>:</p>
<table class="ptable">
${line("Residents", B.pop, M.pop, num)}
${line("Median household income", B.inc, M.inc, money)}
${line("Median home value (owners' own estimate)", B.hv, M.hv, money)}
${line("Median gross rent", B.rent, M.rent, money)}
${line("Homes that are owner-occupied", B.own, M.own, share)}
${line("Housing units vacant", B.vac, M.vac, share)}
${line("Residents below the poverty line", B.pov, M.pov, share)}
${line("Adults 25+ with a bachelor's degree", B.ba, M.ba, share)}
${line("Median age", B.age, M.age, v => (typeof v === "number" ? String(v) : "not reported"))}
${line("Median year homes were built", B.yb, M.yb, v => (typeof v === "number" ? String(v) : "not reported"))}
${row("Race and ethnicity", `${share(B.bl)} Black, ${share(B.wh)} white, ${share(B.hi)} Hispanic or Latino`, "non-Hispanic Black / non-Hispanic white / Hispanic")}
</table>`, "From the U.S. Census (ACS 2020–2024)"),
      typeof B.mrv === "number" && B.nres ? block("calculated", `<p>Homes on the 2026 roll in this block group: <strong>${num(B.nres)}</strong> improved residential parcels, middle market value <strong>${usd(B.mrv)}</strong>${typeof B.hs === "number" ? `, ${share(B.hs)} with a homestead exemption` : ""}. This parcel: ${noValue(r) ? "no value set" : usd(r.tmv)}.${typeof B.hv === "number" ? ` The census median home value here is ${usd(B.hv)}. The two measure different things: the roll is the Assessor's estimate as of 01/01/2023, and the census figure is what owners say their homes are worth.` : ""}</p>`, "Calculated from the 2026 roll and the census") : "",
      block("explanation", `<p>These numbers <strong>describe the neighborhood, not you or this property's owner</strong>, and the Assessor doesn't use them to set values. Census figures are survey estimates with margins of error, which are large for small areas like block groups <cite>S39</cite>. To see how this parcel compares with similar parcels on the roll, ask "How does my property compare to others in my area?"</p>`)
    ];
  }

  /* ---------- Questions about the selected property ---------- */
  // Checked in order; the first match wins. Specific questions first, the broad "tax" catch-all last.
  const INTENTS = [
    { id: "pid", re: /\b(parcel (number|id|#|no)|tax bill (number|#)|bill number|account number)\b/i },
    { id: "special", re: /\b(downtown development|ddd\b|security district|improvement district|special(-| )district|special taxing)/i },
    // "I think my value is wrong" is about disputing the value, not looking it up.
    { id: "right", re: /\b(wrong|incorrect|mistake|error|too high|not right|isn'?t right|unfair|overvalued|over-?assessed)\b/i },
    // Layer 3: how this parcel sits among similar parcels in its area.
    { id: "area", re: /\b(neighbou?rs'?|my area|the area|this area|nearby (homes|houses|properties|values)|other (homes|houses|properties|parcels)|similar (homes|houses|properties|parcels)|(homes|houses|properties) like mine|compared? (to|with) (others|other|my neighbou?rhood|the neighbou?rhood|similar)|market context|typical)\b/i },
    // Where the parcel is and what its census block group looks like, never who owns it.
    { id: "place", re: /\b(neighbou?rhood|census|demographics?|block group|who lives|population|median income|household income|poverty|renters?|race|racial|ethnic(ity)?|community|where is (it|this|my (house|home|property))|map|located|location|tract)\b/i },
    { id: "compare", re: /\b(2025|last year|previous year|prior year|change[ds]?|went up|go(ing|ne)? up|increase[ds]?|decrease[ds]?|went down|go(ing)? down|compared?|year over year|2026 (to|vs\.?|and) 2027)\b/i },
    { id: "tax", re: /\b(tax(es)? (bill|owe|due|amount|estimate)|how much (tax|will i (pay|owe)|do i (pay|owe)|are my taxes|is my (tax|bill))|estimate|my (\d{4} )?(tax )?bill|(next|upcoming|2027|2026) (tax )?bill|bill (be|for 2027|next year)|property tax(es)?\b.*\b(how much|estimate)|millage|mills|what (are|is) my (\d{4} )?tax(es)?)/i },
    { id: "taxable", re: /\btaxable\b|\bwhy (is|are) my (tax(es)?|taxable).*\b(zero|0|nothing)\b/i },
    { id: "homestead", re: /\bhomestead\b/i },
    { id: "freeze", re: /\b(freeze|frozen|special assessment|sal)\b/i },
    { id: "veteran", re: /\b(veteran|first responder|other exemption)\b/i },
    { id: "exemptions", re: /\b(exempt|exemptions?)\b/i },
    { id: "assessed", re: /\bassess(ed|ment)\b.*\b(value|amount|number)?|\b10 ?%|\bratio\b/i },
    { id: "value", re: /\b(market value|worth|value[ds]?|apprais)/i },
    { id: "building", re: /\b(square (feet|footage)|sq\.? ?ft|bed(room)?s?|bath(room)?s?|condition|size|how big|pool|kitchen)\b/i },
    { id: "built", re: /\b(year built|what year was|when was (it|my house|this|the house|my home) built|how old|built)\b/i },
    { id: "sale", re: /\b(sale|sold|bought|buy|purchase|transfer|closing)\b/i },
    { id: "owner", re: /\b(owner|who owns|my name|owner'?s name)\b/i },
    { id: "type", re: /\b(district|ward|occupancy|type of property|property type|zoned|zoning|classif)/i },
    { id: "tax", re: /\b(tax(es)?|bill|owe|pay)\b/i }
  ];

  // strict: skip the broad "tax/bill/pay" catch-all (used to decide whether a general question is really about a property).
  function intentOf(q, strict) {
    const hit = (strict ? INTENTS.slice(0, -1) : INTENTS).find(i => i.re.test(q));
    return hit ? hit.id : null;
  }

  // Answers that need a human contact (CLAUDE.md §4 rule 4): exemptions, disputes, deadlines, "I don't know".
  const CONTACT_INTENTS = ["right", "compare", "freeze", "owner", "homestead", "veteran", "exemptions", "tax", "special"];

  function answer(r0, question, meta) {
    const r = rec(r0);
    const intent = intentOf(question);
    if (!intent) return null;
    const head = `<h3>${esc(r.a)} <span class="pid">parcel ${esc(r.id)}</span></h3>`;
    const out = parts => {
      const body = parts.filter(Boolean).join("");
      return {
        intent,
        html: head + body + sourceLine(meta, /S31|2027/.test(body)),
        contact: CONTACT_INTENTS.includes(intent) || /I don't know/.test(body)
      };
    };
    const missingValue = () => out([block("missing", `<p><strong>I don't know</strong> this parcel's value: the roll records $0 market and assessed value, which usually means no value is set in this file. The Assessor's property search at nolaassessor.com is the official source.</p>`)]);

    switch (intent) {
      case "pid":
        return out([block("recorded", `<p>Parcel ID: <strong>${esc(r.id)}</strong>. Field: Parcel ID(s). On this roll it's the same as the Tax Bill # and Assessment Parcel Number.</p>`)]);
      case "special":
        return out([block("missing", `<p><strong>I don't know.</strong> The state roll files don't record special taxing districts such as the Downtown Development District or neighborhood security districts, and their fees aren't in the computed tax I show <cite>S30</cite>. Your tax bill from the Bureau of the Treasury lists every charge <cite>S27</cite>, and BGR's dashboard shows which districts apply where <cite>S18</cite>.</p>`)]);
      case "value":
        if (noValue(r)) return missingValue();
        return out([
          block("recorded", `<p>Total market value: <strong>${usd(r.tmv)}</strong> (land ${usd(r.lmv)} + buildings ${usd(r.imv)}). Fields: Total, Land and Improvement Market Value.</p>`),
          block("explanation", `<p>This is the Assessor's mass-appraisal estimate of what the property would sell for, not an appraisal of your specific house <cite>S10</cite>. It reflects the market as of ${esc(meta.assessmentDate)}; values from the last reappraisal are used for tax years 2024 through 2027 <cite>S32</cite>.${r.has27 ? (r.m27 === r.tmv ? ` The 2027 roll filed with the state keeps it at the same ${usd(r.m27)} <cite>S31</cite>.` : ` The 2027 roll filed with the state changes it to ${usd(r.m27)} <cite>S31</cite>.`) : ""}</p>`)
        ]);
      case "assessed": {
        if (noValue(r)) return missingValue();
        const ratio = r.tmv ? r.tav / r.tmv : 0;
        const rule = ratioRule(r);
        const text = {
          "10": "Your assessed value is exactly 10% of market value, which is the rule for land and homes.",
          "10/15": "Your assessed value is 10% of the land value plus 15% of the building value, the rule for commercial and other non-residential buildings.",
          freeze: "Your record shows an assessment freeze, which is why the ratio can be below the usual 10% <cite>S7</cite>."
        }[rule] || "Your ratio doesn't match either usual rule, and <strong>I don't know why</strong>. Ask the Assessor's Office.";
        return out([
          block("recorded", `<p>Assessed value: <strong>${usd(r.tav)}</strong> (land ${usd(r.lav)} + buildings ${usd(r.iav)}). Field: Total Assessed Value.</p>`),
          block("calculated", `<p>${usd(r.tav)} ÷ ${usd(r.tmv)} market value = <strong>${pct(ratio)}</strong>.</p>`),
          block("explanation", `<p>Louisiana assesses land and residential buildings at 10% of market value and other buildings, such as commercial ones, at 15% <cite>S1</cite>. ${text}</p>`)
        ]);
      }
      case "taxable": {
        const calc = Math.max(0, r.tav - r.hs - r.ve - r.fr - r.oe);
        return out([
          block("recorded", `<p>Taxable assessed value: <strong>${usd(r.tx)}</strong>. Field: Taxable Assessed Value.</p>${exemptNote(r)}`),
          block("calculated", `<p>${usd(r.tav)} assessed − ${usd(r.hs)} homestead − ${usd(r.ve)} veteran − ${usd(r.fr)} first responder − ${usd(r.oe)} other = ${usd(calc)} (never below $0). ${Math.abs(calc - r.tx) <= 1 ? "This matches the recorded value." : `That differs from the recorded ${usd(r.tx)}, and I don't know why; ask the Assessor's Office.`}</p>`),
          r.tx === 0 && r.t26 > 0 ? block("recorded", `<p>Even so, the roll computes <strong>${usd(r.t26)}</strong> in 2026 tax on this parcel (LTC millage file) <cite>S30</cite>.</p>`) : "",
          r.tx === 0 && r.t26 > 0 ? block("calculated", `<p>That's the police and fire millages "without homestead exemption" (${NO_HS_MILLS} mills), which still apply to the exempted value: ${usd(r.tav)} × ${NO_HS_MILLS} ÷ 1,000 = ${usd(r.tav * NO_HS_MILLS / 1000)}.</p>`) : "",
          block("explanation", `<p>Most millages are applied to the taxable value <cite>S11</cite>.${r.tx === 0 ? " A taxable value of $0 means your exemptions cover the whole assessed value for those millages; the police and fire millages without homestead exemption are the exception <cite>S30</cite>." : ""}</p>`)
        ]);
      }
      case "tax": {
        if (typeof r.t26 !== "number") {
          return out([block("missing", `<p><strong>I don't know.</strong> No computed tax is recorded for this parcel in the roll's millage file. Your bill comes from the Bureau of the Treasury <cite>S27</cite>.</p>`)]);
        }
        const ml = mills(r, meta, 2026), ml27 = mills(r, meta, 2027);
        const upcoming27 = r.has27 && nextRoll(meta) === 2027;
        const line26 = `Computed tax on the <strong>2026 roll</strong> (bills that were due early 2026): <strong>${usd(r.t26)}</strong>${ml ? `, from ${ml.toFixed(2)} total mills` : ""}${r.th26 ? `, after a homestead reduction of ${usd(r.th26)}` : ""}. Taxable assessed value: ${usd(r.tx)} <cite>S30</cite>.`;
        const line27 = r.has27 ? `Computed tax on the <strong>2027 roll</strong> (your next bill, due early 2027): <strong>${usd(r.t27)}</strong>${ml27 ? ` at ${ml27.toFixed(2)} mills` : ""}${r.th27 ? `, after a homestead reduction of ${usd(r.th27)}` : ""} <cite>S31</cite>.` : "";
        return out([
          block("recorded", upcoming27 ? `<p>${line27}</p><p>${line26}</p>${exemptNote(r)}` : `<p>${line26}</p>${line27 ? `<p>${line27}</p>` : ""}${exemptNote(r)}`, r.has27 ? "Recorded in the 2026 and 2027 rolls" : null),
          r.t26 < 0 || (r.has27 && r.t27 < 0) ? block("missing", `<p>The roll records a <strong>negative</strong> computed tax for this parcel, which a bill can't be. <strong>I don't know why</strong>; it may be a data error, so ask the Assessor's Office or the Bureau of the Treasury.</p>`) : "",
          upcoming27 ? rollForward(r) : "",
          taxCheck(r, ml),
          block("explanation", `<p>${r.hs ? `Homestead reduces every levy except the police and fire millages "without homestead exemption" (${NO_HS_MILLS} mills), so you still pay those on the first $7,500 <cite>S30</cite>. ` : ""}These totals <strong>don't include special-district fees</strong> such as the Downtown Development District or neighborhood security districts, which are billed separately <cite>S17</cite>. Your actual bill and due date come from the Bureau of the Treasury; 2026 bills were due Feb. 28, 2026, and the 2027 due date hasn't been announced <cite>S35</cite>.</p>`)
        ]);
      }
      case "homestead": {
        const changed27 = r.has27 && r.h27 !== r.hs;
        return out([
          block("recorded", r.hs
            ? `<p>Homestead exemption: <strong>${usd(r.hs)}</strong> of assessed value${r.hsp && !/^100/.test(r.hsp) ? `, covering ${esc(r.hsp.replace(/^0+/, ""))}% of the ownership` : ""}. Field: Homestead Exemption Amount.</p>`
            : `<p>No homestead exemption is recorded on this parcel. Field: Homestead Exemption = No.</p>`),
          r.hs && r.th26 ? block("recorded", `<p>Taxes the exemption removed on the 2026 roll: <strong>${usd(r.th26)}</strong> a year (homestead reduction in the LTC millage file). Homestead doesn't reduce the police and fire "without homestead" millages <cite>S30</cite>.</p>`) : "",
          changed27 ? block("recorded", r.h27
            ? `<p>On the 2027 roll the homestead exemption is <strong>${usd(r.h27)}</strong> <cite>S31</cite>.</p>`
            : `<p><strong>On the 2027 roll this parcel has no homestead exemption</strong> <cite>S31</cite>. The roll doesn't say why (for example a sale, a move, or an owner's death). If you still own and live here, ask the Assessor's Office right away.</p>`, "Recorded in the 2027 roll") : "",
          block("explanation", r.hs || r.h27
            ? `<p>The full exemption is $7,500 of assessed value, the first $75,000 of market value <cite>S2</cite>. Once granted, it stays on, and you don't reapply each year, unless something changes, like a sale or a change in ownership <cite>S8</cite>.${r.hs && r.hs < 7500 ? " Yours is less than $7,500, usually because only part of the ownership qualifies, or the assessed value is below $7,500." : ""}</p>`
            : `<p>If you own this home and live in it as your primary residence, you can apply at the Assessor's Office <cite>S7</cite><cite>S8</cite>. Ask me "How do I apply for the homestead exemption?" for the documents to bring.</p>`)
        ]);
      }
      case "freeze":
        return out([
          block("recorded", r.fz === "0"
            ? `<p>No assessment freeze is recorded. Field: Freeze Code(s) = 0.</p>`
            : `<p>This parcel has an assessment freeze (Special Assessment Level), code <strong>${esc(r.fz)}</strong>. Field: Freeze Code(s).</p>`),
          block("explanation", r.fz === "0"
            ? `<p>Owners 65+, permanently disabled owners, and veterans with a 50%+ rating who have homestead and meet the income limit can freeze their assessed value <cite>S1</cite><cite>S24</cite>.${r.hs ? "" : " The freeze requires a homestead exemption, and none is recorded here."}</p>`
            : `<p>The freeze locks the assessed value, not the tax bill; millage changes still apply <cite>S24</cite>. <strong>I don't know</strong> what code ${esc(r.fz)} means (age, disability, or veteran). The roll's code table isn't published with this file, so ask the Assessor's Office.</p>`)
        ]);
      case "veteran":
      case "exemptions": {
        const list = [r.hs && `homestead ${usd(r.hs)}`, r.ve && `veteran ${usd(r.ve)}`, r.fr && `first responder ${usd(r.fr)}`, r.oe && `other ${usd(r.oe)}`].filter(Boolean);
        return out([
          block("recorded", `<p>${list.length ? `Exemptions on this parcel: <strong>${list.join(", ")}</strong> of assessed value.` : "No exemption is recorded on this parcel."} Assessment freeze: ${r.fz === "0" ? "none" : "yes (code " + esc(r.fz) + ")"}. Fields: Homestead / Veteran / First Responder / Other Exemption Amount, Freeze Code(s).</p>${exemptNote(r)}`),
          block("explanation", `<p>Veterans with a VA disability rating of 50–69% get the next $2,500 of assessed value exempt, 70–99% the next $4,500, and 100% (or unemployability) the rest of the home's value <cite>S37</cite>. Even a fully exempted home still pays the police and fire millages "without homestead exemption" (${NO_HS_MILLS} mills) <cite>S30</cite>. First responders can get about $2,500 of assessed value off <cite>S7</cite>. "Other" exemptions usually mean government, religious or nonprofit property.</p>`)
        ]);
      }
      case "compare": {
        if (!r.has27) {
          return out([block("missing", `<p><strong>I don't know.</strong> This parcel ID isn't in the 2027 roll; it may have been split, merged or renumbered. The 2025 roll isn't available to me at all. Ask the Assessor's Office.</p>`)]);
        }
        const dm = r.m27 - r.tmv, dx = r.x27 - r.tx, dt = r.t27 - (r.t26 || 0);
        const m26 = mills(r, meta, 2026), m27 = mills(r, meta, 2027);
        const dmill = m26 && m27 ? m27 - m26 : 0;
        // Name each cause the record shows; never pin a change on millage when the taxable value moved.
        const causes = [];
        if (r.st27 !== r.st) causes.push(r.st27 === "EX" ? "the parcel became exempt" : "the parcel is no longer exempt");
        if (r.h27 !== r.hs) causes.push(r.h27 ? `the homestead exemption changed (${usd(r.hs)} → ${usd(r.h27)})` : "the homestead exemption was removed");
        if (dm !== 0) causes.push(`the market value changed (${sgn(dm)})`);
        if (dx !== 0 && !causes.length) causes.push(`the taxable value changed (${sgn(dx)})`);
        if (Math.abs(dmill) >= 0.005) causes.push(`the total millage changed (${m26.toFixed(2)} → ${m27.toFixed(2)})`);
        const taxLine = Math.abs(dt) < 1
          ? "Computed tax <strong>didn't change</strong>."
          : `Computed tax changed by <strong>${sgn(dt)}</strong>${causes.length === 1 ? `, because ${causes[0]}` : causes.length ? `. What changed: ${causes.join("; ")}` : ""}.`;
        return out([
          block("recorded", `<table class="ptable">
${row("Market value", `${usd(r.tmv)} → ${usd(r.m27)}`, "2026 → 2027 roll")}
${r.h27 !== r.hs ? row("Homestead exemption", `${usd(r.hs)} → ${usd(r.h27)}`, "2026 → 2027 roll") : ""}
${r.st27 !== r.st ? row("Status", `${r.st === "EX" ? "Exempt" : "Taxable"} → ${r.st27 === "EX" ? "Exempt" : "Taxable"}`, "2026 → 2027 roll") : ""}
${row("Taxable assessed value", `${usd(r.tx)} → ${usd(r.x27)}`, "2026 → 2027 roll")}
${m26 && m27 ? row("Total mills", `${m26.toFixed(2)} → ${m27.toFixed(2)}`, "LTC millage files") : ""}
${row("Computed tax", `${usd(r.t26 || 0)} → ${usd(r.t27)}`, "LTC millage files")}
</table>`, "Recorded in the 2026 and 2027 rolls"),
          block("calculated", `<p>Market value ${dm === 0 ? "<strong>didn't change</strong>" : `changed by <strong>${sgn(dm)}</strong> (${dm > 0 ? "+" : "−"}${pct(Math.abs(dm) / (r.tmv || 1))})`}. ${taxLine}${dm > 0 && dx === 0 && r.fz !== "0" ? " Taxable value stayed the same because of the assessment freeze on this parcel." : ""}</p>`),
          nextRoll(meta) === 2027 ? rollForward(r) : "",
          block("explanation", `<p>Compared by parcel ID ${esc(r.id)}. Values from the last reappraisal (market as of Jan. 1, 2023) are used for tax years 2024 through 2027 <cite>S32</cite>, so 98% of parcels keep the same value on the 2027 roll <cite>S31</cite>; changes usually come from sales, new construction, corrections or appeals. New values are expected with the reappraisal in 2027, for the 2028 roll. I can't compare with 2025: that roll isn't available to me.</p>`)
        ]);
      }
      case "area":
        return out(areaAnswer(r, meta));
      case "place":
        return out(placeAnswer(r, meta));
      case "building":
        return out([block("missing", `<p><strong>I don't know.</strong> This roll doesn't include square footage, bedrooms, bathrooms, condition or features: those fields are blank or zero for every parcel. The Assessor's property search may show them, and wrong building details are one of the easiest things to get corrected <cite>S10</cite>.</p>`)]);
      case "built":
        return out([r.yb
          ? block("recorded", `<p>Year built: <strong>${esc(r.yb)}</strong>. Field: Year(s) Built. Treat it as approximate; most recorded years are rounded to the nearest 5 or 10.</p>`)
          : block("missing", `<p><strong>I don't know.</strong> No usable year built is recorded. For non-residential parcels the roll shows 1994 as a placeholder, so I hide it.</p>`)]);
      case "sale": {
        const newer = r.has27 && r.td27 && r.td27 !== r.td;
        return out([r.td || newer
          ? block("recorded", `<p>Last recorded transfer${newer ? " on the 2026 roll" : ""}: <strong>${esc(r.td || "not recorded")}</strong>${r.it ? `, document type ${esc(r.it)}` : ""}. Fields: Transfer Date(s), Instrument Type(s).${newer ? ` The 2027 roll records a later transfer on <strong>${esc(r.td27)}</strong> <cite>S31</cite>.` : ""}</p>`)
          : block("missing", `<p>No usable transfer date is recorded. The roll uses 12/31/1994 as a placeholder for older transfers.</p>`),
          block("missing", `<p>I don't show sale prices. In this roll they're often $0 or a nominal amount and none are marked verified, so they'd mislead.</p>`)]);
      }
      case "owner":
        return out([block("missing", `<p>I don't show owner names or mailing addresses. The roll has them, but this prototype leaves them out for privacy. The Assessor's property search shows the owner of record.</p>`)]);
      case "type":
        return out([block("recorded", `<p>${title(r.occ)} property in Municipal District ${esc(r.d)}, Ward ${esc(r.w)}${r.sub ? `, area "${title(r.sub)}"` : ""}. Fields: Occupancy Type, Municipal District, Ward, Subdivision.</p>`),
          block("missing", `<p>Zoning isn't in this roll; it comes from the City's zoning map, not the Assessor.</p>`)]);
      case "right":
        return out([block("recorded", noValue(r) ? `<p>This record shows $0 market and assessed value, so there's no value on file for me to show.</p>` : `<p>Recorded market value <strong>${usd(r.tmv)}</strong>, assessed <strong>${usd(r.tav)}</strong>, taxable <strong>${usd(r.tx)}</strong>.</p>`),
          block("explanation", `<p>I can't tell you whether your value is wrong; that's a judgment for you and the Assessor. If you think it's too high, the path is an informal review with the Assessor, then the Board of Review <cite>S4</cite><cite>S6</cite>. Ask me "How do I appeal?" for the steps.</p>${meta.appealStatus ? `<p>${meta.appealStatus}</p>` : ""}`)]);
    }
    return null;
  }

  /* ---------- Bringing the layers together ----------
     When a property is selected and the owner asks a general question, context() adds what THIS record shows
     about that topic under the knowledge-base answer. Keyed by kb.js entry id. Recorded facts only. */
  function context(r0, entryId, meta) {
    const r = rec(r0);
    const up27 = r.has27 && nextRoll(meta) === 2027;
    const tax = typeof r.t26 === "number"
      ? `Computed tax: <strong>${usd(r.t26)}</strong> on the 2026 roll${r.has27 ? `, <strong>${usd(r.t27)}</strong> on the 2027 roll${up27 ? " (your next bill, filed before the Council's Nov. 5 roll-forward)" : ""}` : ""} (LTC millage files).` : "";
    const hsLine = (r.hs
      ? `A homestead exemption of <strong>${usd(r.hs)}</strong> is on this parcel (Homestead Exemption Amount)${r.th26 ? `, removing ${usd(r.th26)} of 2026 tax` : ""}.`
      : `<strong>No homestead exemption</strong> is recorded on this parcel (Homestead Exemption Amount).`)
      + (r.has27 && r.h27 !== r.hs ? ` On the 2027 roll: <strong>${r.h27 ? usd(r.h27) : "none"}</strong>.` : "");
    const fzLine = r.fz === "0" ? "No assessment freeze is recorded (Freeze Code(s) = 0)." : `An assessment freeze is recorded (Freeze Code ${esc(r.fz)}).`;
    const values = noValue(r)
      ? "This record shows $0 market and assessed value (no value set in this file)."
      : `Market value <strong>${usd(r.tmv)}</strong>, assessed <strong>${usd(r.tav)}</strong>, taxable <strong>${usd(r.tx)}</strong> (Total Market, Total Assessed, Taxable Assessed Value).`;
    const change = r.has27
      ? `2026 → 2027 roll: market value ${usd(r.tmv)} → ${usd(r.m27)}${r.m27 === r.tmv ? " (no change)" : ""}${typeof r.t26 === "number" ? `; computed tax ${usd(r.t26)} → ${usd(r.t27)}` : ""}.`
      : "This parcel ID isn't in the 2027 roll.";
    const others = [r.ve && `veteran ${usd(r.ve)}`, r.fr && `first responder ${usd(r.fr)}`, r.oe && `other ${usd(r.oe)}`].filter(Boolean);
    const exLine = others.length ? `Other exemptions on this parcel: ${others.join(", ")}.` : "No veteran, first responder or other exemption is recorded.";
    const lines = {
      "how-value-set": [values], "value-up-no-change": [values, change], "assessed-vs-market": [values], audit: [values],
      "bill-calc": [values, tax], mill: [tax], rollback: [change], "bill-due": [tax], "payment-plan": [tax], "special-districts": [tax],
      commercial: [`Occupancy type: ${title(r.occ)}.`, values],
      "homestead-apply": [hsLine], "homestead-renew": [hsLine], "sold-moved": [hsLine], heirs: [hsLine],
      sal: [hsLine, fzLine], veteran: [hsLine, exLine], "first-responder": [hsLine, exLine], "amendments-2026": [hsLine, fzLine],
      "reassess-taxes": [change], "why-2027": [change], cap: [change, fzLine], "roll-years": [change],
      "appeal-how": [values], "appeal-where": [values], "appeal-evidence": [values], "appeal-missed": [values], ltc: [values]
    }[entryId];
    if (!lines) return "";
    const body = lines.filter(Boolean).map(l => `<p>${l}</p>`).join("");
    if (!body) return "";
    return `<div class="yours">${block("recorded", body, `Your property: ${esc(r.a)} · parcel ${esc(r.id)}`)}<p class="srcline">From the 2026 roll${r.has27 ? " and the 2027 roll filed with the state" : ""}; values as of ${esc(meta.assessmentDate)} <cite>S30</cite>${r.has27 ? "<cite>S31</cite>" : ""}. Ask about it directly (like "How much tax will I pay?") for the full breakdown.</p></div>`;
  }

  /* Plain-text facts about the selected parcel, for the optional AI explanation (ai.js). Every line names its
     roll and field, so the model can only restate recorded or calculated values. */
  function facts(r0, meta) {
    const r = rec(r0);
    const L = [];
    const ml26 = mills(r, meta, 2026), ml27 = mills(r, meta, 2027);
    L.push(`Selected property: ${r.a.replace(/\s+/g, " ")}, parcel ${r.id}, ${plain(title(r.occ))}, Municipal District ${r.d}, Ward ${r.w}${r.sub ? `, roll area "${plain(title(r.sub))}"` : ""}. Values reflect the market as of ${meta.assessmentDate}. [S30]`);
    if (noValue(r)) L.push("The record shows $0 market and assessed value: no value is set in this file, so the value is unknown (do not call it $0).");
    L.push(`Recorded, 2026 roll: market value ${usd(r.tmv)} (land ${usd(r.lmv)}, buildings ${usd(r.imv)}); assessed value ${usd(r.tav)}; homestead exemption ${r.hs ? usd(r.hs) : "none"}; veteran exemption ${r.ve ? usd(r.ve) : "none"}; first responder exemption ${r.fr ? usd(r.fr) : "none"}; other exemption ${r.oe ? usd(r.oe) : "none"}; taxable assessed value ${usd(r.tx)}; assessment freeze ${r.fz === "0" ? "none" : "yes (code " + r.fz + ", meaning not published)"}; status ${r.st === "EX" ? "exempt" : "taxable"}. [S30]`);
    if (typeof r.t26 === "number") L.push(`Recorded, 2026 roll millage file (bills that were due Feb. 28, 2026): computed tax ${usd(r.t26)}${ml26 ? ` at ${ml26.toFixed(2)} total mills` : ""}${r.th26 ? `, after a homestead reduction of ${usd(r.th26)}` : ""}. Special-district fees are not included. [S30]`);
    if (r.has27) {
      L.push(`Recorded, 2027 roll filed Sept. 4, 2026 (the next bill, due early 2027): market value ${usd(r.m27)}${r.m27 === r.tmv ? " (unchanged)" : ""}; homestead ${r.h27 ? usd(r.h27) : "none"}; status ${r.st27 === "EX" ? "exempt" : "taxable"}; taxable assessed value ${usd(r.x27)}; computed tax ${usd(r.t27)}${ml27 ? ` at ${ml27.toFixed(2)} total mills` : ""}. [S31]`);
      if (r.st27 !== "EX" && r.a27 > 0) {
        const lo = usd(ROLL_FORWARD_2027 * r.x27 / 1000), hi = usd(ROLL_FORWARD_2027 * r.a27 / 1000);
        L.push(`Calculated by the Navigator: the City Council approved a ${ROLL_FORWARD_2027}-mill roll-forward on Nov. 5, 2026, after that file [S33]; if those mills are added on top, the 2027 bill would be about ${lo === hi ? lo : `${lo} to ${hi}`} more than the ${usd(r.t27)} in the file. Final rates are not known. [S33][S31]`);
      }
      if (typeof r.t26 === "number") L.push(`Calculated by the Navigator from the two rolls: computed tax change 2026 to 2027 = ${sgn(r.t27 - r.t26)}; market value change = ${sgn(r.m27 - r.tmv)}; taxable value change = ${sgn(r.x27 - r.tx)}. [S30][S31]`);
      if (r.h27 !== r.hs) L.push(`The homestead exemption is ${usd(r.hs)} on the 2026 roll and ${r.h27 ? usd(r.h27) : "none"} on the 2027 roll. The roll does not say why; do not guess (for example, do not assume a sale or a move). [S30][S31]`);
      if (r.st27 !== r.st) L.push(`Status changes from ${r.st === "EX" ? "exempt" : "taxable"} (2026) to ${r.st27 === "EX" ? "exempt" : "taxable"} (2027); the roll does not say why. [S30][S31]`);
    } else L.push("This parcel ID is not in the 2027 roll. [S31]");
    L.push(`Year built: ${r.yb || "not recorded"}. Last transfer date: ${r.td27 || r.td || "not recorded"}. Not in this roll: square footage, bedrooms, bathrooms, condition, special districts. Not shown: sale price, owner name. [S30]`);
    const B = meta.bg && r.bg ? meta.bg.bg[r.bg] : null;
    if (B) L.push(`Census neighborhood (describes the area's residents, never the owner): ${B.name}, block group ${r.bg} [S38]. ACS 2020–2024: median household income ${money(B.inc)}; median home value (owners' estimate) ${money(B.hv)}; median rent ${money(B.rent)}; owner-occupied ${share(B.own)}; vacant units ${share(B.vac)}; poverty ${share(B.pov)}. [S39]`);
    const a = areaGroup(r, meta.areas);
    if (a && !noValue(r)) L.push(`Calculated area context (a distribution only, never a judgment of this parcel's value): ${a.g.n} ${a.kind} in ${plain(a.label)}; middle half of market values ${usd(a.g.mv[1])} to ${usd(a.g.mv[3])}, middle value ${usd(a.g.mv[2])}; this parcel is ${position(r.tmv, a.g.mv)}. [S30]`);
    return L;
  }

  const api = { card, candidateLine, answer, intentOf, context, facts, nextRoll };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NolaProperty = api;
})(typeof window !== "undefined" ? window : this);
