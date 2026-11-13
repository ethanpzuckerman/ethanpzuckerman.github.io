/* NOLA Assessment Navigator — Layer 1 chat logic.
   Guardrails run first, then keyword retrieval over ENTRIES (kb.js).
   Rules come from CLAUDE.md §4. */

(function () {
  const MIN_SCORE = 3;

  // Known appeal windows (CLAUDE.md §2.6). Times are Central (CDT, UTC-5).
  // Add each new roll here when the Assessor announces it.
  const APPEAL_WINDOWS = [
    { roll: 2025, opens: "2024-07-15T00:00:00-05:00", closes: "2024-08-20T16:00:00-05:00", closesText: "4 p.m. on Aug. 20, 2024", src: "S22" },
    { roll: 2026, opens: "2025-07-15T00:00:00-05:00", closes: "2025-08-20T16:00:00-05:00", closesText: "Aug. 20, 2025 (one Assessor notice says Aug. 18; please confirm)", src: "S6" },
    { roll: 2027, opens: "2026-07-15T00:00:00-05:00", closes: "2026-08-20T16:00:00-05:00", closesText: "4 p.m. on Thursday, Aug. 20, 2026", src: "S4" }
  ].map(w => ({ ...w, opens: new Date(w.opens), closes: new Date(w.closes) }));

  const CONTACTS_HTML = `<div class="contacts"><strong>Talk to a person:</strong>
<ul><li>Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: <a class="tel" href="tel:+15047548811">(504) 754-8811</a>. <a href="https://www.nolaassessor.com/" target="_blank" rel="noopener">nolaassessor.com</a></li>
<li>Board of Review (City Council): <a href="https://council.nola.gov/resources/property-tax-assessments-and-appeals/" target="_blank" rel="noopener">council.nola.gov</a></li>
<li>Tax bills and payments: <a href="https://nola.gov/property-tax/" target="_blank" rel="noopener">nola.gov/property-tax</a></li>
<li>Free legal help: Southeast Louisiana Legal Services, <a href="https://slls.org/" target="_blank" rel="noopener">slls.org</a></li></ul></div>`;

  const STOP = new Set(("a an the is are was were be been i my me we our you your it its of to in on for and or with do does did can could would should will how what when where why who which this that there their about am if at by from as so just get " +
    "please hi hey hello thanks thank ok okay know tell want like much many also any still really need new orleans nola property house home tax taxes have has had im i'm").split(" "));

  function stem(w) {
    return w.replace(/'s$/, "").replace(/(ing|ed|es|s)$/, "");
  }

  function tokens(text) {
    return text.toLowerCase().replace(/[^a-z0-9%' ]+/g, " ").split(/\s+/)
      .filter(w => w && !STOP.has(w)).map(stem);
  }

  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  function appealStatus(now) {
    const open = APPEAL_WINDOWS.find(w => now >= w.opens && now <= w.closes);
    if (open) {
      return `<strong>Status: the appeal window for the ${open.roll} roll is open now.</strong> It closes at <strong>${open.closesText}</strong> <cite>${open.src}</cite>.`;
    }
    const upcoming = APPEAL_WINDOWS.find(w => now < w.opens);
    if (upcoming) {
      return `<strong>Status:</strong> the appeal window for the ${upcoming.roll} roll hasn't opened yet. It closes at ${upcoming.closesText} <cite>${upcoming.src}</cite>.`;
    }
    const last = APPEAL_WINDOWS[APPEAL_WINDOWS.length - 1];
    const y = now.getFullYear();
    const midJuly = new Date(y, 6, 15), lateAug = new Date(y, 7, 21);
    if (now >= midJuly && now < lateAug) {
      return `<strong>Status: the appeal window for the ${y + 1} roll may be open right now.</strong> It usually runs mid-July to mid-August <cite>S4</cite><cite>S5</cite>, but I don't have this year's dates. Check nolaassessor.com today.`;
    }
    if (now >= lateAug && last.roll < y + 1) {
      return `<strong>Status: the appeal window for the ${y + 1} roll has most likely closed.</strong> It usually ends in mid-to-late August <cite>S4</cite><cite>S5</cite>, but I don't have this year's exact dates. The next window, for the ${y + 2} roll, should open in summer ${y + 1}.`;
    }
    const nextYear = now < midJuly ? y : y + 1;
    return `<strong>Status: the appeal window for the ${last.roll} roll closed at ${last.closesText}</strong> <cite>${last.src}</cite>. The next window, for the ${nextYear + 1} roll, should open in summer ${nextYear} (it usually runs mid-July to mid-August) <cite>S4</cite><cite>S5</cite>. The exact dates haven't been announced, so I don't know them yet.`;
  }

  // Bills are due early in the roll's year, so from March on the next bill is next year's roll.
  function nextBill(now) {
    const y = now.getMonth() >= 2 ? now.getFullYear() + 1 : now.getFullYear();
    if (now.getMonth() === 11 || now.getMonth() <= 1) {
      return `Bills for the ${y} roll should be going out about now. Check nola.gov for the due date, which hasn't been confirmed here.`;
    }
    return `The next bills, for the ${y} roll, are expected around late ${y - 1} or January ${y}; the City hasn't announced the due date yet.`;
  }

  // Precompute stemmed keyword sets.
  const INDEX = ENTRIES.map(e => ({
    entry: e,
    core: new Set((e.core || []).flatMap(tokens)),
    kw: new Set(e.keywords.flatMap(tokens)),
    title: new Set(tokens(e.title)),
    phrases: e.phrases.map(p => p.toLowerCase())
  }));

  // Every word the knowledge base knows about. A question word outside it means
  // the closest entry probably doesn't answer what was asked (CLAUDE.md §4 rule 2).
  const VOCAB = new Set(ENTRIES.flatMap(e => [
    ...e.keywords, ...(e.core || []), e.title, ...e.phrases, e.answer.replace(/<[^>]+>/g, " ")
  ].flatMap(tokens)));

  const VOCAB_LIST = [...VOCAB].filter(w => w.length >= 3 && !/^\d/.test(w));
  // A misspelled word ("homstead", "exemtion", "mil") is read as the closest knowledge-base word.
  const fixCache = new Map();
  function fix(w) {
    if (VOCAB.has(w) || w.length < 3 || /^\d/.test(w)) return w;
    if (fixCache.has(w)) return fixCache.get(w);
    const limit = w.length >= 7 ? 2 : 1;
    let best = w, bestD = limit + 1;
    for (const v of VOCAB_LIST) {
      const dd = editDistance(w, v);
      if (dd < bestD || (dd === bestD && v.length > best.length)) { best = v; bestD = dd; }
    }
    const out = bestD <= limit ? best : w;
    fixCache.set(w, out);
    return out;
  }
  const fixedTokens = text => tokens(text).map(fix);

  // Everyday words that never signal a new topic.
  const COMMON = new Set(("about above after again against also always another anyone anything around back because before being below best better between both bring came come comes coming could didn doesn doing done down each else even ever every everyone except first found from gave give given goes going gone good great happen happens help here into keep last least less make makes many maybe mean means might more most much must never next none only other others over people really right said same says seem should since some someone something soon still such sure take than that them then these they thing things think those though through told under until upon very wait well went were what whatever when whether which while whom whose will with within without would wrong year years your yours worth says said whats what's dont don't gotta wanna gonna husband wife spouse mother father mom dad son daughter kids family myself yourself long time yeah yes nope okay sure guess wondering curious quick question questions explain simple simply exactly basically actually literally".split(" ")));

  function unknownTerms(question) {
    // Capitalized words after the first are usually names (streets, neighborhoods), so skip them.
    const raw = question.replace(/[^A-Za-z0-9%' ]+/g, " ").split(/\s+/)
      .filter((w, i) => i === 0 || !/^[A-Z]/.test(w))
      .map(w => w.toLowerCase().replace(/'(s|re|ve|ll|d|m)$|n't$/, "").replace(/'/g, ""));
    return [...new Set(raw.filter(w => w.length > 3 && !/^\d/.test(w) && !STOP.has(w) && !COMMON.has(w) && !VOCAB.has(fix(stem(w)))))];
  }

  function score(question) {
    const q = question.toLowerCase();
    const qt = new Set(fixedTokens(question));
    return INDEX.map(ix => {
      let s = 0;
      qt.forEach(t => { if (ix.kw.has(t)) s += 1; if (ix.core.has(t)) s += 2; if (ix.title.has(t)) s += 0.5; });
      ix.phrases.forEach(p => { if (q.includes(p)) s += 3; });
      return { entry: ix.entry, score: s };
    }).sort((a, b) => b.score - a.score);
  }

  /* ---------- Guardrails (CLAUDE.md §4) ---------- */
  const GUARDS = [
    {
      name: "personal-data",
      test: q => /\b\d{3}-?\d{2}-?\d{4}\b/.test(q) || /\bssn\b|social security number/i.test(q),
      reply: () => `<p>Please don't share Social Security numbers or other personal details here. I don't need them, and I don't store them. I can answer general questions about assessments, exemptions, and appeals.</p>`,
      contact: true, allowAnswer: false
    },
    {
      name: "advice",
      test: q => /\bshould i\b|\bshould we\b|\bdo you recommend\b|\bwould you recommend\b|\bwill i win\b|\bchances\b|\bworth (it|appealing)\b|\bwhat value should\b|\bhow much should i ask\b|\blegal advice\b|\btax advice\b|\bavoid (paying )?tax/i.test(q),
      reply: () => `<p><strong>That's a decision for you, and I can't give legal or tax advice.</strong> I can explain how the process works, and a person at the offices below can look at your situation.</p>`,
      contact: true, allowAnswer: true
    },
    {
      name: "property-lookup",
      test: q => /\b\d{2,5}\s+[a-z0-9.]+(\s+[a-z0-9.]+)?\s+(st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|pl|place|ct|court|ln|lane|way|hwy|pkwy)\b/i.test(q)
        || /\b(look ?up|search)\b.*\b(my|property|parcel|house|address)\b/i.test(q)
        // Only when asking for the number itself, not "what is my assessment based on?"
        || /\bparcel (number|id)\b/i.test(q)
        || /\b(what('?s| is)|find|show me|tell me) my (property'?s? |house'?s? |home'?s? )?(assessment|assessed value|value|tax bill)\s*(\?|$|for\b|at\b|on \d)/i.test(q),
      reply: () => `<p><strong>To see your property's numbers, find it first.</strong> Type just the address (like "1234 Magazine St") or the parcel ID from your tax bill in the <em>Find your property</em> box, then confirm it's yours. I won't guess at numbers for a property you haven't selected.</p>`,
      contact: true, allowAnswer: true
    },
    {
      name: "not-property-tax",
      test: q => /\b(sales tax|income tax|car tax|vehicle tax|auto tax|car registration|flood insurance|homeowners? insurance|insurance premium|short[- ]term rental|str permit|business license|occupational license)\b/i.test(q),
      reply: () => `<p><strong>I don't know.</strong> I only cover property assessments and property taxes in the City of New Orleans, so I can't answer that. The offices below can point you to the right place.</p>`,
      contact: true, allowAnswer: false
    },
    {
      name: "other-parish",
      // "Parish" is required for names that are also New Orleans streets (Jefferson Ave., Lafayette St.).
      test: q => /\b(jefferson|st\.? tammany|st\.? bernard|plaquemines|lafayette|east baton rouge)\s+parish\b/i.test(q)
        || /\b(metairie|kenner|slidell|gretna|covington|mandeville|baton rouge|shreveport|texas|florida|mississippi)\b/i.test(q),
      reply: () => `<p>I only cover property in the <strong>City of New Orleans (Orleans Parish)</strong>. I don't know the rules or deadlines elsewhere. Contact that parish's assessor.</p>`,
      contact: false, allowAnswer: false
    }
  ];

  function renderCites(html) {
    return html.replace(/<cite>(S\d+)<\/cite>/g, (_, id) => {
      const s = SOURCES[id];
      return s ? `<a class="cite" href="${s.url}" target="_blank" rel="noopener" title="${s.label}">[${id}]</a>` : "";
    });
  }

  function sourcesBlock(ids) {
    const items = ids.map(id => {
      const s = SOURCES[id];
      if (!s) return "";
      const tag = s.official ? "" : ` <span class="secondary">secondary</span>`;
      return `<li><span class="sid">${id}</span> <a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>${tag}</li>`;
    }).join("");
    return `<details class="sources" open><summary>Sources</summary><ol>${items}</ol></details>`;
  }

  function idkReply() {
    return `<p><strong>I don't know.</strong> That question isn't covered by the sources I've been given, and I'd rather not guess. The Assessor's Office can help. You can also try rephrasing, or tap one of the suggested questions.</p>`;
  }

  // Collect every [S#] used in a block so the source list matches the text.
  function citedIds(html, extra) {
    const ids = [];
    (html.match(/<cite>(S\d+)<\/cite>/g) || []).forEach(m => {
      const id = m.replace(/<\/?cite>/g, "");
      if (!ids.includes(id)) ids.push(id);
    });
    (extra || []).forEach(id => { if (!ids.includes(id)) ids.push(id); });
    return ids;
  }

  function answer(question, now) {
    now = now || new Date();
    const parts = [];
    let contact = false;
    let allowAnswer = true;

    for (const g of GUARDS) {
      if (g.name === "property-lookup" && selected) continue; // a property is already selected
      if (g.test(question)) {
        parts.push(g.reply());
        contact = contact || g.contact;
        allowAnswer = allowAnswer && g.allowAnswer;
        break;
      }
    }

    let entry = null;
    if (allowAnswer) {
      const best = score(question)[0];
      if (best && best.score >= MIN_SCORE) entry = best.entry;
    }

    let body = "";
    let sourceIds = [];
    if (entry) {
      // Rule 1: never render an entry without sources.
      if (!entry.sources || entry.sources.length === 0) {
        parts.push(idkReply());
        contact = true;
      } else {
        body = entry.answer.replace(/\{\{APPEAL_STATUS\}\}/g, appealStatus(now)).replace(/\{\{NEXT_BILL\}\}/g, nextBill(now));
        const unknown = unknownTerms(question);
        if (unknown.length) {
          parts.push(`<p><strong>I don't know</strong> about <strong>${unknown.map(escapeHtml).join(", ")}</strong>. My sources don't cover it, so this may not answer your question. Ask the office below to be sure. Here is the closest topic I have:</p>`);
          contact = true;
        } else if (parts.length) parts.push(`<p class="bridge">Here is the general information:</p>`);
        parts.push(`<h3>${entry.title}</h3>` + body);
        sourceIds = citedIds(body, entry.sources);
        contact = contact || !!entry.contact;
      }
    } else if (parts.length === 0) {
      parts.push(idkReply());
      contact = true;
    }

    let html = renderCites(parts.join(""));
    if (sourceIds.length) html += sourcesBlock(sourceIds);
    if (contact) html += CONTACTS_HTML;
    return { html, entryId: entry ? entry.id : null };
  }

  /* ---------- UI ---------- */
  const SUGGESTIONS = [
    "How does the Assessor decide what my house is worth?",
    "How is my property tax bill calculated?",
    "What is a mill?",
    "How do I apply for the homestead exemption?",
    "I'm over 65. Can my assessment be frozen?",
    "Do I have to reapply every year?",
    "What does the 2027 reassessment mean?",
    "My value went up a lot. Will my taxes go up the same amount?",
    "Is there a cap on how much my assessment can rise?",
    "How do I appeal my assessment, and what's the deadline?",
    "What evidence do I need?",
    "I missed the deadline. What can I do now?",
    "My parent died. What happens to the homestead?"
  ];
  const PROPERTY_SUGGESTIONS = [
    "How much tax will I pay?",
    "What will my 2027 bill be?",
    "What is my property's market value?",
    "Do I have a homestead exemption?",
    "How do I apply for the homestead exemption?",
    "How does my property compare to others in my area?",
    "What neighborhood is it in?",
    "How did my value change on the 2027 roll?",
    "Do I have an assessment freeze?",
    "I think my value is wrong"
  ];

  function setChips(list) {
    const chips = document.getElementById("chips");
    chips.innerHTML = "";
    list.forEach(s => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = s;
      b.addEventListener("click", () => ask(s));
      chips.appendChild(b);
    });
  }

  function addMsg(role, html) {
    const log = document.getElementById("log");
    const div = document.createElement("div");
    div.className = "msg " + role;
    div.innerHTML = html;
    log.appendChild(div);
    div.scrollIntoView({ behavior: "smooth", block: "start" });
    return div;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---------- Property lookup and selected property (Layer 2) ---------- */
  const DATA_BASE = "data/web/2026/";
  // The single-file build (pipeline/build_standalone.py) embeds the data and provides window.NOLA_LOAD.
  const loadData = window.NOLA_LOAD || (name => fetch(DATA_BASE + name).then(r => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }));
  const lookup = window.NolaLookup ? NolaLookup.create(loadData) : null;
  let selected = null;
  let metaInfo = null;
  const lists = []; // every candidate list shown, so a click on an older list picks from that list
  let pending = null; // a property question asked before a property was picked; answered right after the pick

  // An address inside a question ("What's the tax on 1205 St. Charles Ave #607?").
  const ADDRESS_IN_TEXT = /\b\d{1,6}(?:\s+1\/2)?\s+(?:[NSEW]\.?\s+)?(?:[A-Za-z0-9.']+\s+){0,4}?(?:st|street|ave|avenue|av|blvd|boulevard|bl|dr|drive|rd|road|pl|place|ct|court|ln|lane|way|wy|hwy|highway|pkwy|parkway|pw|cir|circle|ter|terrace|row|walk|sq|square)\b\.?(?:,?\s*(?:apt\.?|unit|suite|ste\.?|#)\s*[A-Za-z0-9-]+)?/i;
  const PARCEL_IN_TEXT = /\b\d{9}\b/;

  async function ensureMeta() {
    metaInfo = metaInfo || await lookup.meta();
    if (metaInfo.areas === undefined) {
      metaInfo.areas = null;
      try { metaInfo.areas = await loadData("areas.json"); } catch (e) { /* Layer 3 just says it doesn't know */ }
    }
    if (metaInfo.bg === undefined) {
      metaInfo.bg = null;
      try { metaInfo.bg = await loadData("bg.json"); } catch (e) { /* the neighborhood answer says it doesn't know */ }
    }
    metaInfo.appealStatus = appealStatus(new Date());
    return metaInfo;
  }

  // Questions about how the system works go to the knowledge base even when a property is selected.
  const GENERAL_FIRST = /^(how (do|can|should|would) (i|we|you)|how to\b|where\b|what (documents|do i (need|bring))|what is an?\b|what's an?\b|what does .* mean|when (is|are|do|does|will|should)\b|who (do|should|can) i\b|can i (apply|appeal|get)|do i (have|need) to (reapply|apply|appeal)|is there\b)/i;
  // "2027 reassessment", "65 and older freeze", "100 percent disabled veteran": numbers that start a question, not an address.
  const NOT_ADDRESS = /^\s*\d+\s*(%|percent|years?|yrs?|and|or|mills?|roll|reassessment|reappraisal|bills?|tax(es)?|assessment|disabled|veterans?|dollars?|k\b|homestead|freeze|exemption|amendment|appeal|deadline|value|values)\b/i;
  const LOOKS_LIKE_ADDRESS = /^\s*(\d{1,6}[A-Za-z]?(\s+1\/2)?\s+[A-Za-z0-9.' -]{2,}|\d{9})\s*(,.*)?$/;

  function propertyAnswerHtml(q) {
    if (!selected || GENERAL_FIRST.test(q) || !window.NolaProperty) return null;
    if (metaInfo) metaInfo.appealStatus = appealStatus(new Date());
    const a = NolaProperty.answer(selected, q, metaInfo);
    if (!a) return null;
    let html = renderCites(a.html);
    const ids = citedIds(a.html);
    if (ids.length) html += sourcesBlock(ids);
    if (a.contact) html += CONTACTS_HTML;
    return html;
  }

  function renderLookup(res, input) {
    const listId = lists.push(res.candidates.map(c => c.record)) - 1;
    if (res.status === "not_found") {
      return `<p><strong>I couldn't find that property in the 2026 roll.</strong> ${escapeHtml(res.reason || "")}</p>
<p>Tips: check the house number, try the street without "N/S" or the suffix, include your unit number for a condo, or search by the parcel ID from your tax bill. If it still doesn't show up, the Assessor's property search at nolaassessor.com is the official source.</p>` + CONTACTS_HTML;
    }
    const intro = {
      exact: `<p>I found <strong>one record</strong> for "${escapeHtml(input)}". Is this your property?</p>`,
      close: `<p>${escapeHtml(res.reason).replace(/^Closest match:/, "<strong>Closest match:</strong>")}</p>`,
      multiple: `<p><strong>${res.total || res.candidates.length} records</strong> match "${escapeHtml(input)}". ${escapeHtml(res.reason || "")}${(res.total || 0) > res.candidates.length ? ` Showing the first ${res.candidates.length}; add your unit number to narrow it down.` : ""}</p>`
    }[res.status];
    const list = res.candidates.map((c, i) =>
      `<li><button type="button" class="pick" data-list="${listId}" data-pick="${i}">${NolaProperty.candidateLine(c.record)}</button></li>`).join("");
    return intro + `<ul class="picks">${list}</ul><p class="hint">Choose the record that's yours. If none are, try another spelling or your parcel ID.</p>`;
  }

  async function runLookup(input, question) {
    if (!lookup) return;
    pending = question || null;
    const msg = addMsg("bot", `<p>Searching the 2026 roll for "${escapeHtml(input)}"…</p>`);
    try {
      await ensureMeta();
      const res = await lookup.find(input);
      msg.innerHTML = renderLookup(res, input) +
        (pending && res.status !== "not_found" ? `<p class="hint">Once you pick your property, I'll answer: <em>${escapeHtml(pending)}</em></p>` : "");
      if (res.status === "not_found") pending = null;
    } catch (e) {
      pending = null;
      msg.innerHTML = `<p><strong>I couldn't load the property data</strong>, so I can't look this up right now. You can still ask general questions, or use the Assessor's property search at nolaassessor.com.</p>`;
    }
  }

  async function selectProperty(rec) {
    if (!rec) return;
    await ensureMeta();
    selected = rec;
    const bar = document.getElementById("selected");
    bar.hidden = false;
    bar.querySelector(".sel-text").innerHTML = `Selected: <strong>${escapeHtml(rec.a)}</strong> · parcel ${escapeHtml(rec.id)} · 2026 roll`;
    addMsg("bot", NolaProperty.card(rec, metaInfo) +
      `<p>Ask me about this property, like "How much tax will I pay?" or "Do I have a homestead exemption?" Answers label what's <strong>recorded</strong> in the roll, what I <strong>calculated</strong>, and the general <strong>explanation</strong>.</p>`);
    setChips(PROPERTY_SUGGESTIONS);
    if (pending) {
      const q = pending;
      pending = null;
      reply(q);
    }
  }

  function clearProperty() {
    selected = null;
    pending = null;
    document.getElementById("selected").hidden = true;
    setChips(SUGGESTIONS);
    addMsg("bot", `<p>Property cleared. Type another address or parcel ID in the <strong>Find your property</strong> box, or ask a general question.</p>`);
    const addr = document.getElementById("addr");
    if (addr) addr.focus();
  }

  function ask(q) {
    q = q.trim();
    if (!q) return;
    addMsg("user", escapeHtml(q));
    pending = null;
    if (lookup && LOOKS_LIKE_ADDRESS.test(q) && !/\?/.test(q) && !NOT_ADDRESS.test(q)) return runLookup(q);
    // A question that names an address or parcel ID: look that property up first, then answer about it.
    const named = lookup && window.NolaProperty && !GENERAL_FIRST.test(q) && (q.match(PARCEL_IN_TEXT) || q.match(ADDRESS_IN_TEXT));
    if (named && !/^\s*(ssn|social)/i.test(q) && !GUARDS[0].test(q)) {
      const where = named[0].replace(/[?.,]+$/, "");
      const same = selected && (selected.id === where || NolaProperty.intentOf(q) && selectedMatches(where));
      if (!same) return runLookup(where, NolaProperty.intentOf(q) ? q : null);
    }
    reply(q);
  }

  // Is the address the owner typed the one already selected? (Cheap check: same house number and street word.)
  function selectedMatches(where) {
    const a = (selected.a || "").toUpperCase(), w = where.toUpperCase();
    const num = (w.match(/^\d+/) || [""])[0];
    const word = (w.replace(/^\d+\s+/, "").match(/[A-Z]{3,}/) || [""])[0];
    return num && a.startsWith(num + " ") && word && a.includes(word.slice(0, 4));
  }

  // Answer a question with what we have: the selected property, the knowledge base, or both.
  const NON_ENGLISH = /[áéíóúñ¿¡]|[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]|\b(cómo|como|cuándo|cuando|qué|impuesto|propiedad|exención|tôi|thuế|nhà)\b/i;
  const CHANGE_PROPERTY = /\b(change|switch|another|different|other|new) (the )?(selected )?(property|address|house|home|parcel)\b|\bclear (the )?(property|selection)\b/i;

  /* ---------- Optional AI explanation (ai.js; only where the claude.ai runtime offers it) ---------- */
  const history = []; // last few exchanges, so follow-ups like "what about veterans?" make sense to the AI
  const plainText = html => html.replace(/<cite>(S\d+)<\/cite>/g, " [$1]").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

  function kbText(now) {
    return ENTRIES.map(e => `[${e.id}] ${e.title} (sources: ${e.sources.join(", ")})\n` +
      plainText(e.answer.replace(/\{\{APPEAL_STATUS\}\}/g, appealStatus(now)).replace(/\{\{NEXT_BILL\}\}/g, nextBill(now)))).join("\n\n");
  }

  function remember(q, a) {
    history.push({ q, a: a.slice(0, 500) });
    while (history.length > 3) history.shift();
  }

  async function addAI(div, q, isProperty) {
    if (!window.NolaAI || !NolaAI.enabled()) return remember(q, plainText(div.innerHTML));
    const now = new Date();
    const box = document.createElement("div");
    box.className = "ai ai-wait";
    box.innerHTML = `<span class="ai-tag">AI explanation · Claude</span><p>Writing a plain-language answer from the sources below…</p>`;
    div.prepend(box);
    const res = await NolaAI.explain({
      question: q,
      today: now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      status: plainText(appealStatus(now)),
      kb: kbText(now),
      facts: selected && window.NolaProperty ? NolaProperty.facts(selected, metaInfo || {}) : null,
      history: history.slice()
    });
    if (!res || !res.text || res.error || res.rejected) {
      box.remove();
      if (res && (res.rejected || res.error)) console.info("AI explanation not shown:", res.rejected || res.error);
      if (NolaAI.state() === "denied") setAIUI();
      return remember(q, plainText(div.innerHTML));
    }
    box.className = "ai";
    box.innerHTML = `<span class="ai-tag">AI explanation · Claude</span>${NolaAI.render(res.text, SOURCES)}
<p class="ai-note">Written by AI from the cited sources${isProperty || selected ? " and this property's record" : ""}. Every number was checked against them; the full answer is below.</p>`;
    // Add any source the AI cited to the answer's source list, so every link is listed (CLAUDE.md §4 rule 1).
    const list = div.querySelector(".sources ol");
    const have = new Set([...div.querySelectorAll(".sources .sid")].map(x => x.textContent));
    const extra = res.cited.filter(id => !have.has(id) && SOURCES[id]);
    if (list) extra.forEach(id => list.insertAdjacentHTML("beforeend", sourcesBlock([id]).replace(/^.*?<ol>|<\/ol>.*$/g, "")));
    else if (res.cited.length) box.insertAdjacentHTML("beforeend", sourcesBlock(res.cited));
    if (!isProperty) {
      // General answers: tuck the full knowledge-base text under the AI summary; keep sources, contacts and the record visible.
      const det = document.createElement("details");
      det.className = "det";
      det.innerHTML = `<summary>Full answer from the knowledge base</summary>`;
      [...div.children].filter(el => el !== box && !el.matches(".sources, .contacts, .yours")).forEach(el => det.appendChild(el));
      box.after(det);
    }
    remember(q, res.text);
  }

  function setAIUI() {
    const bar = document.getElementById("ai-bar");
    if (!bar || !window.NolaAI) return;
    bar.hidden = !NolaAI.available();
    const box = document.getElementById("ai-on");
    if (box) box.checked = NolaAI.pref();
  }

  function reply(q) {
    const g = GUARDS.find(x => x.test(q));
    // Privacy and out-of-scope guardrails win even with a property selected (CLAUDE.md §4).
    if (g && !g.allowAnswer) { const d = addMsg("bot", answer(q).html); return remember(q, plainText(d.innerHTML)); }
    if (selected && CHANGE_PROPERTY.test(q) && !/\d/.test(q)) {
      return addMsg("bot", `<p>To look at a different property, type its address or parcel ID in the <strong>Find your property</strong> box at the top, or press <strong>Change property</strong> to clear this one.</p>`);
    }
    const lang = NON_ENGLISH.test(q) ? `<p class="hint"><strong>I can only answer in English for now.</strong> Por ahora solo puedo responder en inglés. Hiện tại tôi chỉ trả lời được bằng tiếng Anh. The Assessor's Office can help in person.</p>` : "";
    let prop = propertyAnswerHtml(q);
    if (prop) {
      // An advice question about the selected property: refuse the advice part, then give the record.
      if (g && g.name === "advice") prop = g.reply() + `<p class="bridge">Here is what your record shows:</p>` + prop + (prop.includes('class="contacts"') ? "" : CONTACTS_HTML);
      return addAI(addMsg("bot", lang + prop), q, true);
    }
    const res = answer(q);
    let html = res.html;
    const intent = window.NolaProperty && !GENERAL_FIRST.test(q) ? NolaProperty.intentOf(q, true) : null;
    if (selected && res.entryId && metaInfo) {
      // Bring the layers together: under a general answer, show what the selected record says on that topic.
      const yours = NolaProperty.context(selected, res.entryId, metaInfo);
      if (yours) html = insertBeforeContacts(html, renderCites(yours));
    } else if (!selected && intent && lookup && !["owner", "building"].includes(intent)) {
      pending = q;
      html = insertBeforeContacts(html, `<p class="hint"><strong>Want your own numbers?</strong> Find your property in the box above (address or parcel ID). I'll answer this question for it as soon as you pick it.</p>`);
    }
    addAI(addMsg("bot", lang + html), q, false);
  }

  function insertBeforeContacts(html, extra) {
    const i = html.indexOf('<div class="contacts">');
    return i < 0 ? html + extra : html.slice(0, i) + extra + html.slice(i);
  }

  function init() {
    setChips(SUGGESTIONS);
    const find = document.getElementById("find");
    if (find) find.addEventListener("submit", e => {
      e.preventDefault();
      const input = document.getElementById("addr");
      const v = input.value.trim();
      if (!v) return;
      addMsg("user", escapeHtml(v));
      runLookup(v, pending);
      input.value = "";
    });
    document.getElementById("log").addEventListener("click", e => {
      const b = e.target.closest("[data-pick]");
      if (b) {
        b.closest(".picks").querySelectorAll("button").forEach(x => { x.disabled = x !== b; });
        b.classList.add("picked");
        selectProperty((lists[+b.dataset.list] || [])[+b.dataset.pick]);
      }
    });
    const clr = document.getElementById("clear-prop");
    if (clr) clr.addEventListener("click", clearProperty);
    document.getElementById("ask").addEventListener("submit", e => {
      e.preventDefault();
      const input = document.getElementById("q");
      ask(input.value);
      input.value = "";
      input.focus();
    });
    addMsg("bot", `<p>Hi! I answer general questions about property assessments in the <strong>City of New Orleans</strong>: how values are set, how your tax bill is calculated, exemptions like homestead, the 2027 reassessment, and how to appeal.</p>
<p>To ask about <strong>your</strong> property, find it with the box above using its address or parcel ID, then confirm the record. Property answers use the <strong>2026 and 2027 rolls</strong> from the Louisiana Tax Commission, plus Census data about the neighborhood.</p>
<p class="disclose"><strong>I'm a student prototype, not an official government tool.</strong> Information may be out of date, so always confirm with the Assessor's Office. I can't give legal or tax advice.</p>`);
    if (window.NolaAI) {
      NolaAI.init().then(ok => {
        setAIUI();
        if (ok) addMsg("bot", `<p class="hint"><strong>AI explanations are on.</strong> Answers start with a short explanation written by Claude from the cited sources and your property's record, and checked so it can't add numbers that aren't there. The full answer stays underneath. You can switch it off below.</p>`);
      });
      const box = document.getElementById("ai-on");
      if (box) box.addEventListener("change", () => NolaAI.setPref(box.checked));
    }
    const hash = decodeURIComponent((location.hash || "").slice(1));
    if (hash.startsWith("q=")) ask(hash.slice(2));
  }

  window.NavigatorBot = { answer, score, ask, propertyAnswerHtml, GENERAL_FIRST, kbText };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
