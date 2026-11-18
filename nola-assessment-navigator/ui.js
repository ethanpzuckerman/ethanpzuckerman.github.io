/* NOLA Assessment Navigator: page interface (layout behaviors around the chat in app.js).
   Theme switch, "try" examples, the live "Your property" panel, copy / share on answers, deep links
   (#p=<parcel id> opens a property), keyboard shortcuts, toasts and the source list. Holds no answers itself. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const usd = v => (typeof v === "number" ? "$" + Math.round(v).toLocaleString("en-US") : "—");
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* per-viewer only */ } } };

  /* ---------- Toasts ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove("show"); setTimeout(() => { t.hidden = true; }, 250); }, 2400);
  }
  function copy(text, done) {
    const ok = () => toast(done || "Copied");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, () => toast("Couldn't copy. Select the text instead."));
    else toast("Couldn't copy. Select the text instead.");
  }

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  applyTheme(store.get("nola-theme"));
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    applyTheme(next);
    store.set("nola-theme", next);
  }

  /* ---------- Find a property from anywhere ---------- */
  function findProperty(text, autoPick) {
    const input = $("#addr"), form = $("#find");
    if (!input || !form) return;
    input.value = text;
    form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
    $("#app").scrollIntoView({ behavior: "smooth", block: "start" });
    if (!autoPick) return;
    // Deep links name one parcel: pick it as soon as the single match appears.
    const started = Date.now();
    const poll = setInterval(() => {
      const last = [...document.querySelectorAll("#log .msg.bot")].pop();
      const picks = last ? last.querySelectorAll(".pick:not([disabled])") : [];
      if (picks.length === 1) { clearInterval(poll); picks[0].click(); }
      else if (picks.length > 1 || Date.now() - started > 15000) clearInterval(poll);
    }, 150);
  }

  /* ---------- Your property panel ---------- */
  function renderProperty(r) {
    const body = $("#prop-body"), empty = $("#prop-empty");
    if (!body) return;
    if (!r) { body.hidden = true; empty.hidden = false; body.innerHTML = ""; return; }
    const n = v => (typeof v === "number" ? v : 0);
    const has27 = !r.no27 && typeof r.t27 === "number";
    const hs27 = "h27" in r ? r.h27 : n(r.hs);
    const occ = String(r.occ || "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const metric = (label, value, note) => `<div class="metric"><span>${label}</span><strong>${value}</strong>${note ? `<em>${note}</em>` : ""}</div>`;
    body.innerHTML = `
      <p class="prop-addr">${esc(String(r.a || "").replace(/\s+/g, " "))}</p>
      <p class="prop-meta">Parcel ${esc(r.id)} · ${esc(occ)} · District ${esc(r.d)}</p>
      <div class="metrics">
        ${metric("Market value", usd(n(r.tmv)), "2026 roll")}
        ${metric("Assessed value", usd(n(r.tav)), "")}
        ${metric("Taxable value", usd(n(r.tx)), "")}
        ${metric("Homestead", n(r.hs) ? usd(n(r.hs)) : "None", has27 && hs27 !== n(r.hs) ? (hs27 ? "2027: " + usd(hs27) : "Removed on 2027 roll") : "")}
        ${metric("2026 tax", typeof r.t26 === "number" ? usd(r.t26) : "—", "recorded")}
        ${metric("2027 tax", has27 ? usd(r.t27) : "—", has27 ? "as filed, before roll-forward" : "")}
      </div>
      <div class="prop-actions">
        <button type="button" class="btn" data-act="ask-tax">Explain my tax</button>
        <button type="button" class="btn ghost" data-act="download">Download summary</button>
        <button type="button" class="btn ghost" data-act="share">Copy link</button>
        <button type="button" class="btn ghost" data-act="clear">Change</button>
      </div>
      <p class="fine">Values as of Jan. 1, 2023. Source: Louisiana Tax Commission. Special-district fees not included.</p>`;
    empty.hidden = true;
    body.hidden = false;
    body.dataset.id = r.id;
  }

  /* ---------- Copy and share on each answer ---------- */
  function decorate() {
    document.querySelectorAll("#log .msg.bot:not([data-decorated])").forEach(m => {
      if (m.querySelector(".picks") || /^Searching/.test(m.textContent.trim())) return; // lookup lists stay plain
      if (!m.querySelector(".sources, .prov, .contacts, .pcard")) return;
      m.dataset.decorated = "1";
      const bar = document.createElement("div");
      bar.className = "msg-actions";
      bar.innerHTML = `<button type="button" data-act="copy-answer" title="Copy this answer">Copy answer</button>`;
      m.appendChild(bar);
    });
  }

  function answerText(m) {
    return [...m.children].filter(el => !el.matches(".msg-actions, .handoff")).map(el => el.innerText).join("\n\n").trim()
      + "\n\n(From the NOLA Assessment Navigator, not an official tool. Confirm with the Orleans Parish Assessor's Office.)";
  }

  /* ---------- Jump to latest ---------- */
  function setupJump() {
    const box = $("#chat-scroll"), jump = $("#jump");
    if (!box || !jump) return;
    const check = () => { jump.hidden = box.scrollHeight - box.scrollTop - box.clientHeight < 240 || box.scrollHeight <= box.clientHeight; };
    box.addEventListener("scroll", check, { passive: true });
    new MutationObserver(check).observe(box, { childList: true, subtree: true });
    jump.addEventListener("click", () => {
      const last = [...document.querySelectorAll("#log .msg")].pop();
      if (last) last.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Sources list ---------- */
  function fillSources() {
    const ol = $("#all-sources");
    if (!ol || typeof SOURCES === "undefined") return;
    ol.innerHTML = Object.entries(SOURCES).map(([id, s]) =>
      `<li><span class="sid">${id}</span> <a href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a>${s.official ? "" : ' <span class="secondary">secondary</span>'}</li>`).join("");
  }

  /* ---------- Active section in the nav ---------- */
  function setupNav() {
    const links = [...document.querySelectorAll(".nav-links a")];
    const nav = $(".nav");
    const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(a => { const t = document.querySelector(a.getAttribute("href")); if (t) io.observe(t); });
  }

  function init() {
    const theme = $("#theme");
    if (theme) theme.addEventListener("click", toggleTheme);
    document.querySelectorAll("[data-try]").forEach(b => b.addEventListener("click", () => findProperty(b.dataset.try, false)));
    const find = $("#find");
    if (find) find.addEventListener("submit", () => { setTimeout(() => $("#app").scrollIntoView({ behavior: "smooth", block: "start" }), 0); });

    document.addEventListener("nav:select", e => {
      const r = e.detail && e.detail.record;
      renderProperty(r);
      if (r && history.replaceState) history.replaceState(null, "", "#p=" + encodeURIComponent(r.id));
    });
    document.addEventListener("nav:clear", () => {
      renderProperty(null);
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    });

    document.addEventListener("click", e => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      const act = b.dataset.act;
      if (act === "copy-answer") copy(answerText(b.closest(".msg")), "Answer copied");
      if (act === "ask-tax") { window.NavigatorBot && NavigatorBot.ask("How much tax will I pay?"); $("#app").scrollIntoView({ behavior: "smooth", block: "start" }); }
      if (act === "download" && window.NavigatorBot) NavigatorBot.downloadSummary();
      if (act === "clear" && window.NavigatorBot) NavigatorBot.clearProperty();
      if (act === "share") {
        const id = $("#prop-body").dataset.id;
        copy(location.origin + location.pathname + "#p=" + encodeURIComponent(id), "Link to this property copied");
      }
    });

    const newChat = $("#new-chat");
    if (newChat) newChat.addEventListener("click", () => { location.replace(location.pathname + location.search); });

    // Keyboard: "/" asks, Ctrl/Cmd+K searches, Escape leaves a box.
    document.addEventListener("keydown", e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "");
      if (e.key === "/" && !typing) { e.preventDefault(); $("#q").focus(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#addr").focus(); $("#addr").select(); }
      else if (e.key === "Escape" && typing) e.target.blur();
    });

    const log = $("#log");
    if (log) new MutationObserver(() => requestAnimationFrame(decorate)).observe(log, { childList: true, subtree: true });
    decorate();
    setupJump();
    fillSources();
    setupNav();

    // Deep link: #p=<parcel id> opens that property.
    const h = decodeURIComponent((location.hash || "").slice(1));
    if (h.startsWith("p=") && h.length > 2) setTimeout(() => findProperty(h.slice(2), true), 50);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
