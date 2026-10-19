/* NOLA Assessment Navigator — Layer 1 chat logic.
   Guardrails run first, then keyword retrieval over ENTRIES (kb.js).
   Rules come from CLAUDE.md §4. */

(function () {
  const MIN_SCORE = 3;

  // 2027 roll appeal window (CLAUDE.md §2.6, source S4). Times are Central (CDT, UTC-5).
  const APPEAL_OPENS = new Date("2026-07-22T00:00:00-05:00");
  const APPEAL_CLOSES = new Date("2026-08-20T16:00:00-05:00");

  const CONTACTS_HTML = `<div class="contacts"><strong>Talk to a person:</strong>
<ul><li>Orleans Parish Assessor's Office, City Hall, 1300 Perdido St., Room 4E01. Appraiser appointments: <span class="tel">(504) 754-8811</span>. <a href="https://www.nolaassessor.com/" target="_blank" rel="noopener">nolaassessor.com</a></li>
<li>Board of Review (City Council): <a href="https://council.nola.gov/resources/property-tax-assessments-and-appeals/" target="_blank" rel="noopener">council.nola.gov</a></li>
<li>Tax bills and payments: <a href="https://nola.gov/property-tax/" target="_blank" rel="noopener">nola.gov/property-tax</a></li>
<li>Free legal help: Southeast Louisiana Legal Services, <a href="https://slls.org/" target="_blank" rel="noopener">slls.org</a></li></ul></div>`;

  const STOP = new Set("a an the is are was were be been i my me we our you your it its of to in on for and or with do does did can could would should will how what when where why who which this that there their about am if at by from as so just get".split(" "));

  function stem(w) {
    return w.replace(/'s$/, "").replace(/(ing|ed|es|s)$/, "");
  }

  function tokens(text) {
    return text.toLowerCase().replace(/[^a-z0-9%' ]+/g, " ").split(/\s+/)
      .filter(w => w && !STOP.has(w)).map(stem);
  }

  function appealStatus(now) {
    if (now < APPEAL_OPENS) {
      return `<strong>Status:</strong> the online appeal window for the 2027 roll opens July 22, 2026 and closes at 4 p.m. on Aug. 20, 2026 <cite>S4</cite>.`;
    }
    if (now <= APPEAL_CLOSES) {
      return `<strong>Status: the appeal window is open now.</strong> It closes at <strong>4 p.m. on Thursday, Aug. 20, 2026</strong> <cite>S4</cite>.`;
    }
    return `<strong>Status: the appeal window for the 2027 roll closed at 4 p.m. on Aug. 20, 2026</strong> <cite>S4</cite>. The next window, for the 2028 roll, should open in summer 2027 (it usually runs mid-July to mid-August). The exact dates haven't been announced, so I don't know them yet.`;
  }

  // Precompute stemmed keyword sets.
  const INDEX = ENTRIES.map(e => ({
    entry: e,
    kw: new Set(e.keywords.flatMap(tokens)),
    title: new Set(tokens(e.title)),
    phrases: e.phrases.map(p => p.toLowerCase())
  }));

  function score(question) {
    const q = question.toLowerCase();
    const qt = new Set(tokens(question));
    return INDEX.map(ix => {
      let s = 0;
      qt.forEach(t => { if (ix.kw.has(t)) s += 1; if (ix.title.has(t)) s += 0.5; });
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
        || /\bparcel (number|id)\b|\bwhat is my (assessment|assessed value|value|tax bill)\b|\bmy (property'?s?|house'?s?|home'?s?) (value|assessment)\b/i.test(q),
      reply: () => `<p><strong>I can't look up individual properties yet.</strong> Parcel lookup (Layer 2) is still being built. To see your value now, use the property search on <a href="https://www.nolaassessor.com/" target="_blank" rel="noopener">nolaassessor.com</a> or call the Assessor's Office. I won't guess at numbers for your property.</p>`,
      contact: true, allowAnswer: true
    },
    {
      name: "other-parish",
      test: q => /\b(jefferson|st\.? tammany|st\.? bernard|plaquemines|metairie|kenner|slidell|baton rouge|lafayette|texas|florida|mississippi)\b/i.test(q),
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
        body = entry.answer.replace(/\{\{APPEAL_STATUS\}\}/g, appealStatus(now));
        if (parts.length) parts.push(`<p class="bridge">Here is the general information:</p>`);
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
    "I missed the deadline. What can I do now?"
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
