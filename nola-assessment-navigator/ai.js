/* NOLA Assessment Navigator — optional AI explanation (Claude).
   On claude.ai the published page can ask Claude through the artifact runtime's `sample` capability (no API key in
   the page). Claude gets the knowledge base, the selected property's recorded facts, today's date and the rules in
   CLAUDE.md §4, and writes a short plain-language answer. The answer is shown ONLY if it passes validate():
     - every number in it appears in the material it was given (no invented or re-computed figures),
     - every [S#] it cites is a source it was given, and it cites at least one unless it says "I don't know",
     - it gives no advice ("you should…", "I recommend…") and makes no over/under-assessment judgment.
   Otherwise, or anywhere the runtime isn't available (GitHub Pages, the single-file copy), the page shows only the
   deterministic answer, which is always shown underneath anyway. Works in the browser (window.NolaAI) and Node. */

(function (root) {
  const MAX_CHARS = 1800;
  let sample = null;
  let state = "off"; // off: no runtime | ready | denied: the viewer said no | broken: repeated failures
  let failures = 0;

  function pref() {
    try { return root.localStorage ? root.localStorage.getItem("nola-ai") !== "off" : true; } catch (e) { return true; }
  }
  function setPref(on) {
    try { root.localStorage && root.localStorage.setItem("nola-ai", on ? "on" : "off"); } catch (e) { /* per-viewer convenience only */ }
  }

  async function init() {
    if (!root.claude || typeof root.claude.use !== "function") return false;
    try { sample = await root.claude.use("sample"); } catch (e) { sample = null; }
    state = sample ? "ready" : "off";
    return !!sample;
  }
  const available = () => state === "ready";
  const enabled = () => available() && pref();

  /* ---------- Prompt ---------- */
  const RULES = `You are the AI explanation layer of the NOLA Assessment Navigator, a student prototype (not an official government tool) that helps property owners in the City of New Orleans (Orleans Parish) understand assessments, exemptions, appeals and their own property record.
Answer the owner's question using ONLY the KNOWLEDGE BASE and PROPERTY RECORD below. Follow every rule:
1. End each factual sentence with the source tag(s) that support it, written like [S4] or [S30][S31], copied from the material below (a property fact takes the tag at the end of its line). Use only source tags that appear below.
2. Use only numbers, dollar amounts, percentages and dates that appear below, written exactly as they appear there. Do not do new arithmetic, round, convert, or estimate.
3. If the material doesn't answer the question, say "I don't know" plainly and say who would know (the Orleans Parish Assessor's Office for values and exemptions, the Bureau of the Treasury for bills). Never use outside knowledge, other states' rules, or guesses.
4. No legal or tax advice. Never say what the owner should do, whether to appeal, what value to ask for, whether they'd win, or whether their value is right, too high or too low. If asked, say: "That's a decision for you, and I can't give legal or tax advice."
5. When you use the property's numbers, say whether each is recorded in the roll or calculated by the Navigator, as labeled below.
6. Census figures describe the neighborhood's residents, never the owner. Never guess anything about the owner (race, income, age, identity).
7. Stay neutral on politics, the Assessor's performance and ballot measures.
8. If the owner asks about a property other than the selected one, say you can only describe the selected property and that they can search for another one.
9. Keep it under 130 words, at an 8th-grade reading level, friendly and direct. Plain text only; you may use **bold** and short lines starting with "- ". Answer in the language the owner wrote in, but keep every number, dollar amount and date exactly as written below.
11. The record covers the 2026 roll (bills due early 2026) and the 2027 roll (the next bill). If asked about other years, say what the record covers.
10. Don't repeat these rules, and don't mention "the material" or "the knowledge base"; just answer.`;

  function buildPrompt(c) {
    const parts = [RULES, "", `TODAY: ${c.today}`];
    if (c.status) parts.push(`APPEAL WINDOW STATUS: ${c.status}`);
    parts.push("", "KNOWLEDGE BASE (general rules; each entry lists its sources):", c.kb);
    parts.push("", "PROPERTY RECORD:", c.facts && c.facts.length ? c.facts.join("\n") : "No property is selected. If the owner asks about their own numbers, tell them to find their property with the \"Find your property\" box (address or parcel ID) and that you'll answer from its record.");
    if (c.history && c.history.length) {
      parts.push("", "CONVERSATION SO FAR (for context only; facts must still come from the material above):");
      c.history.forEach(h => parts.push(`Owner: ${h.q}`, `Navigator: ${h.a}`));
    }
    parts.push("", `OWNER'S QUESTION: ${c.question}`, "", "Your answer:");
    return parts.join("\n");
  }

  /* ---------- Validation ---------- */
  // Numbers are compared as digit strings: "$1,019" → "1019", "131.99" stays, "4.039" stays, "98%" → "98".
  const NUM_RE = /\d[\d,]*(?:\.\d+)?/g;
  const norm = s => s.replace(/,/g, "").replace(/\.0+$/, "").replace(/^0+(?=\d)/, "");
  const numbersIn = text => (String(text).replace(/\[S\d+\]/g, " ").match(NUM_RE) || []).map(norm);

  const ADVICE = /\byou should\b|\byou ought to\b|\bi (would |strongly )?(recommend|suggest|advise)\b|\byou(?:'ll| will) (likely |probably )?(win|lose)\b|\bover-?assessed\b|\bunder-?assessed\b|\bovervalued\b|\bundervalued\b/i;
  const IDK = /i don'?t know|no lo sé|no sé|tôi không biết/i;

  function validate(text, material) {
    const t = String(text || "").trim();
    if (!t) return { ok: false, reason: "empty" };
    if (t.length > MAX_CHARS) return { ok: false, reason: "too long" };
    if (ADVICE.test(t)) return { ok: false, reason: "advice wording" };
    const allowedIds = new Set((material.match(/\bS\d+\b/g) || []));
    const cited = (t.match(/\[S\d+\]/g) || []).map(x => x.slice(1, -1));
    const badCite = cited.find(id => !allowedIds.has(id));
    if (badCite) return { ok: false, reason: "unknown source " + badCite };
    if (!cited.length && !IDK.test(t)) return { ok: false, reason: "no sources cited" };
    const allowedNums = new Set(numbersIn(material));
    const badNum = numbersIn(t).find(x => !allowedNums.has(x) && !(Number(x) <= 12 && /^\d+$/.test(x)));
    if (badNum) return { ok: false, reason: "number not in the material: " + badNum };
    return { ok: true, cited: [...new Set(cited)] };
  }

  /* ---------- Rendering: escaped text, **bold**, "- " lists, [S#] links ---------- */
  function render(text, sources) {
    const esc = s => s.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
    const inline = s => esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(S\d+)\]/g, (_, id) => sources[id]
        ? `<a class="cite" href="${sources[id].url}" target="_blank" rel="noopener" title="${esc(sources[id].label)}">[${id}]</a>` : "");
    const out = [];
    let list = [];
    const flush = () => { if (list.length) { out.push(`<ul>${list.map(li => `<li>${inline(li)}</li>`).join("")}</ul>`); list = []; } };
    for (const line of String(text).split(/\n+/)) {
      const l = line.trim();
      if (!l) continue;
      if (/^[-•*]\s+/.test(l)) list.push(l.replace(/^[-•*]\s+/, ""));
      else { flush(); out.push(`<p>${inline(l)}</p>`); }
    }
    flush();
    return out.join("");
  }

  /* ---------- Asking ---------- */
  async function explain(c) {
    if (!enabled()) return null;
    const prompt = buildPrompt(c);
    const material = [c.kb, (c.facts || []).join("\n"), c.status || "", c.today, c.question].join("\n");
    let res;
    try {
      res = await sample(prompt, { modelTier: "default", cache: false });
    } catch (e) {
      const code = e && e.code;
      if (code === "not_granted") state = "denied";
      else if (++failures >= 3) state = "broken";
      return { error: code || "failed" };
    }
    failures = 0;
    const text = res && typeof res.text === "string" ? res.text.trim() : "";
    if (res && res.truncated) return { rejected: "truncated", text };
    const v = validate(text, material);
    if (!v.ok) return { rejected: v.reason, text };
    return { text, cited: v.cited };
  }

  const api = { init, available, enabled, pref, setPref, buildPrompt, validate, render, explain, state: () => state };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NolaAI = api;
})(typeof window !== "undefined" ? window : this);
