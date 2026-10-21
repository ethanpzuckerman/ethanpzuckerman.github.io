/* NOLA Assessment Navigator — Layer 1 chat logic.
   Guardrails run first, then keyword retrieval over ENTRIES (kb.js).
   Rules come from CLAUDE.md §4. */

(function () {
  const MIN_SCORE = 3;

  // Known appeal windows (CLAUDE.md §2.6). Times are Central (CDT, UTC-5).
  // Add each new roll here when the Assessor announces it.
  const APPEAL_WINDOWS = [
    { roll: 2025, opens: "2024-07-15T00:00:00-05:00", closes: "2024-08-20T16:00:00-05:00", closesText: "4 p.m. on Aug. 20, 2024", src: "S22" },
    { roll: 2026, opens: "2025-07-15T00:00:00-05:00", closes: "2025-08-20T16:00:00-05:00", closesText: "Aug. 20, 2025", src: "S6" },
    { roll: 2027, opens: "2026-07-15T00:00:00-05:00", closes: "2026-08-20T16:00:00-05:00", closesText: "4 p.m. on Thursday, Aug. 20, 2026", src: "S4" }
  ].map(w => ({ ...w, opens: new Date(w.opens), closes: new Date(w.closes) }));

  const CONTACTS_HTML = `<div class="contacts"><strong>Talk to a person:</strong>
<ul><li>Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: <span class="tel">(504) 754-8811</span>. <a href="https://www.nolaassessor.com/" target="_blank" rel="noopener">nolaassessor.com</a></li>
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

  function nextBill(now) {
    const y = now.getMonth() === 0 && now.getDate() <= 31 ? now.getFullYear() : now.getFullYear() + 1;
    if (now.getMonth() === 11 || now.getMonth() === 0) {
      return `Bills for the ${y} roll should be going out now, due around January 31, ${y}`;
    }
    return `The next bill, for the ${y} roll, should arrive around December ${y - 1} and be due around January 31, ${y}`;
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

  // Everyday words that never signal a new topic.
  const COMMON = new Set(("about above after again against also always another anyone anything around back because before being below best better between both bring came come comes coming could didn doesn doing done down each else even ever every everyone except first found from gave give given goes going gone good great happen happens help here into keep last least less make makes many maybe mean means might more most much must never next none only other others over people really right said same says seem should since some someone something soon still such sure take than that them then these they thing things think those though through told under until upon very wait well went were what whatever when whether which while whom whose will with within without would wrong year years your yours worth says said".split(" ")));

  function unknownTerms(question) {
    // Capitalized words after the first are usually names (streets, neighborhoods), so skip them.
    const raw = question.replace(/[^A-Za-z0-9%' ]+/g, " ").split(/\s+/)
      .filter((w, i) => i === 0 || !/^[A-Z]/.test(w))
      .map(w => w.toLowerCase().replace(/'(s|re|ve|ll|d|m)$|n't$/, "").replace(/'/g, ""));
    return [...new Set(raw.filter(w => w.length > 3 && !/^\d/.test(w) && !STOP.has(w) && !COMMON.has(w) && !VOCAB.has(stem(w))))];
  }

  function score(question) {
    const q = question.toLowerCase();
    const qt = new Set(tokens(question));
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
      reply: () => `<p><strong>I can't look up individual properties yet.</strong> Parcel lookup (Layer 2) is still being built. To see your value now, use the property search on <a href="https://www.nolaassessor.com/" target="_blank" rel="noopener">nolaassessor.com</a> or call the Assessor's Office. I won't guess at numbers for your property.</p>`,
      contact: true, allowAnswer: true
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

  function ask(q) {
    q = q.trim();
    if (!q) return;
    addMsg("user", escapeHtml(q));
    addMsg("bot", answer(q).html);
  }

  function init() {
    const chips = document.getElementById("chips");
    SUGGESTIONS.forEach(s => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = s;
      b.addEventListener("click", () => ask(s));
      chips.appendChild(b);
    });
    document.getElementById("ask").addEventListener("submit", e => {
      e.preventDefault();
      const input = document.getElementById("q");
      ask(input.value);
      input.value = "";
      input.focus();
    });
    addMsg("bot", `<p>Hi! I answer general questions about property assessments in the <strong>City of New Orleans</strong>: how values are set, how your tax bill is calculated, exemptions like homestead, the 2027 reassessment, and how to appeal.</p>
<p class="disclose"><strong>I'm a student prototype, not an official government tool.</strong> Information may be out of date, so always confirm with the Assessor's Office. I can't give legal or tax advice, and I can't look up your property yet.</p>`);
    const hash = decodeURIComponent((location.hash || "").slice(1));
    if (hash.startsWith("q=")) ask(hash.slice(2));
  }

  window.NavigatorBot = { answer, score };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
