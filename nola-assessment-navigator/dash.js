/* NOLA Assessment Navigator: property dashboard (below the chat once a property is selected).
   Map of the parcel and its neighbors, tax history chart, "where your 2026 tax goes", the ZIP's home-value trend,
   similar properties nearby, and a side-by-side comparison. Draws only: every figure comes from property.js
   (taxHistory, taxBreakdown, similar, compareRecord) or lookup.js (near, byId, metres). */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const usd = v => (typeof v === "number" ? "$" + Math.round(v).toLocaleString("en-US") : "—");
  const usd2 = v => (typeof v === "number" ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—");
  const spct = v => (typeof v === "number" ? (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(1) + "%" : "—");
  const title = s => String(s || "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const addr = s => String(s || "").replace(/\s+/g, " ").trim();
  const cite = id => (typeof SOURCES !== "undefined" && SOURCES[id]) ? `<a class="cite" href="${SOURCES[id].url}" target="_blank" rel="noopener" title="${esc(SOURCES[id].label)}">[${id}]</a>` : "";
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* per-viewer only */ } } };
  const MAX_COMPARE = 3;

  const S = { base: null, meta: null, nearby: [], similar: [], compare: (store.get("nola-compare") || []).slice(0, MAX_COMPARE), map: null, tiles: null, layer: null, token: 0 };
  const bot = () => window.NavigatorBot;
  const P = () => window.NolaProperty;

  /* ---------- Shared tooltip for chart marks ---------- */
  let tip;
  function showTip(html, x, y) {
    tip = tip || Object.assign(document.body.appendChild(document.createElement("div")), { className: "chart-tip", role: "status" });
    tip.innerHTML = html;
    tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, x - w / 2)) + "px";
    tip.style.top = Math.max(8, y - h - 12) + "px";
  }
  const hideTip = () => { if (tip) tip.hidden = true; };
  document.addEventListener("pointermove", e => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    if (t) showTip(t.getAttribute("data-tip"), e.clientX, e.clientY); else if (!e.target.closest || !e.target.closest(".zip-hit")) hideTip();
  });
  document.addEventListener("focusin", e => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    if (t) { const b = t.getBoundingClientRect(); showTip(t.getAttribute("data-tip"), b.left + b.width / 2, b.top); }
  });
  document.addEventListener("focusout", hideTip);

  /* ---------- Tax history (bars, with the possible roll-forward as a dashed range) ---------- */
  function taxHistoryChart(r, box) {
    const h = P().taxHistory(r);
    box = box || $("#chart-history");
    if (!h) { box.innerHTML = `<p class="muted">No recorded tax for this parcel.</p>`; return; }
    const W = 320, H = 190, padL = 8, padB = 26, padT = 34, bw = 64;
    const top = Math.max(...h.rows.map(x => x.tax + (x.hi || 0))) || 1;
    const y = v => H - padB - (v / top) * (H - padB - padT);
    const xs = h.rows.map((_, i) => padL + 60 + i * 130);
    let svg = `<line class="axis" x1="0" x2="${W}" y1="${H - padB}" y2="${H - padB}"/>`;
    h.rows.forEach((x, i) => {
      const x0 = xs[i], yt = y(x.tax), base = H - padB;
      const tipTxt = `<strong>${x.year} roll</strong><br>Recorded tax ${usd2(x.tax)}${x.hi ? `<br>Possible roll-forward: +${usd(x.lo)} to +${usd(x.hi)} (calculated)` : ""}`;
      if (x.hi) {
        svg += `<rect class="bar-range" x="${x0}" y="${y(x.tax + x.hi)}" width="${bw}" height="${yt - y(x.tax + x.hi)}" rx="4"/>`;
      }
      svg += `<path class="bar" d="M${x0},${base} V${yt + 4} Q${x0},${yt} ${x0 + 4},${yt} H${x0 + bw - 4} Q${x0 + bw},${yt} ${x0 + bw},${yt + 4} V${base} Z"/>`;
      svg += `<rect class="hit" x="${x0 - 10}" y="${padT - 20}" width="${bw + 20}" height="${base - padT + 20}" tabindex="0" data-tip="${esc(tipTxt)}"/>`;
      svg += `<text class="val" x="${x0 + bw / 2}" y="${(x.hi ? y(x.tax + x.hi) : yt) - 8}" text-anchor="middle">${usd(x.tax)}</text>`;
      svg += `<text class="tick" x="${x0 + bw / 2}" y="${H - 8}" text-anchor="middle">${x.year}</text>`;
    });
    const r27 = h.rows[1];
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Recorded tax: ${h.rows.map(x => x.year + " " + usd(x.tax)).join(", ")}">${svg}</svg>
      <p class="chart-note">${r27 ? `<span class="key key-range"></span> Possible increase from the Nov. 5 roll-forward (${h.rollForward} mills), +${usd(r27.lo)} to +${usd(r27.hi)}: calculated, not final. ` : ""}Recorded tax from the state rolls ${h.sources.map(cite).join("")}.</p>`;
  }

  /* ---------- Where the 2026 tax goes (ranked bars; the table is the chart) ---------- */
  function breakdownChart(r, meta) {
    const b = P().taxBreakdown(r, meta);
    const box = $("#chart-breakdown");
    if (!b) { box.innerHTML = `<p class="muted">Not shown for this parcel: it is exempt, has an exemption other than homestead, or its recorded tax doesn't split cleanly by levy. Ask "How much tax will I pay?" for its full record.</p>`; return; }
    const max = b.rows[0].amount;
    box.innerHTML = `<table class="levies">
      <caption class="sr-only">2026 tax by levy</caption>
      <thead class="sr-only"><tr><th>Levy</th><th>Mills</th><th>Amount</th></tr></thead>
      <tbody>${b.rows.map(x => `<tr tabindex="0" data-tip="${esc(`<strong>${x.label}</strong><br>${x.mills} mills × ${x.noHs ? "assessed value (homestead doesn't reduce it)" : "taxable value"} ÷ 1,000 = ${usd2(x.amount)}`)}">
        <th scope="row">${esc(x.label)}<span>${x.mills} mills</span></th>
        <td class="bar-cell"><span class="hbar${x.noHs ? " hbar-alt" : ""}" style="width:${Math.max(2, x.amount / max * 100).toFixed(1)}%"></span></td>
        <td class="amt">${usd(x.amount)}</td></tr>`).join("")}</tbody>
      <tfoot><tr><th scope="row">Total (${b.mills} mills)</th><td></td><td class="amt">${usd2(b.sum)}</td></tr></tfoot>
    </table>
    <p class="chart-note">Calculated from the City's 2026 millage table and this parcel's values; matches the recorded ${usd2(b.recorded)} within $1 ${b.sources.map(cite).join("")}. Special-district fees aren't included.</p>`;
  }

  /* ---------- Neighborhood: this property vs. its area vs. the city ---------- */
  function hoodTile(r, meta) {
    const box = $("#chart-hood"), h = P().neighborhood(r, meta);
    if (!h) { box.innerHTML = `<p class="muted">No area figures for this parcel type.</p>`; return; }
    const areaName = h.level === "city" ? "Citywide" : (h.level === "sub" ? "This area" : "This ward");
    const group = (label, rows, fmt) => {
      const max = Math.max(...rows.map(x => x[1]).filter(v => typeof v === "number")) || 1;
      return `<div class="pair"><p class="pair-label">${label}</p>${rows.map(([name, v, cls]) => typeof v !== "number" ? "" :
        `<div class="pair-row" tabindex="0" data-tip="${esc(`<strong>${name}</strong><br>${label}: ${fmt(v)}`)}"><span class="pair-name">${name}</span><span class="pair-track"><span class="hbar ${cls}" style="width:${Math.max(2, v / max * 100).toFixed(1)}%"></span></span><span class="pair-val">${fmt(v)}</span></div>`).join("")}</div>`;
    };
    const pctf = v => Math.round(v * 100) + "%";
    const taxRows = [["This property", h.mine.t26, "hbar-this"], [areaName + " (median)", h.area.t26, ""]];
    if (h.level !== "city" && h.city) taxRows.push(["New Orleans (median)", h.city.t26, "hbar-city"]);
    const mvRows = [["This property", h.mine.tmv, "hbar-this"], [areaName + " (median)", h.area.mv && h.area.mv[2], ""]];
    if (h.level !== "city" && h.city) mvRows.push(["New Orleans (median)", h.city.mv && h.city.mv[2], "hbar-city"]);
    const hsRows = [[areaName, h.area.hs, ""]];
    if (h.level !== "city" && h.city) hsRows.push(["New Orleans", h.city.hs, "hbar-city"]);
    box.innerHTML = `<p class="hood-of">${esc(h.label.replace(/^the /, ""))[0].toUpperCase() + esc(h.label.replace(/^the /, "")).slice(1)} · ${h.area.n.toLocaleString("en-US")} ${esc(h.kind)}</p>
      <div class="hood-grid">
        ${group("2026 tax", taxRows, usd)}
        ${group("Market value", mvRows, usd)}
        ${group("Share with homestead", hsRows, pctf)}
      </div>
      <ul class="hood-facts">
        <li><strong>Same rate citywide.</strong> This parcel pays ${h.mills || "131.99"} mills, like every parcel on its side of the river (131.99 East Bank, 132.01 Algiers in 2026) ${cite("S11")}${cite("S30")}. Differences between neighborhoods come from values, homestead, and special-district fees billed on top.</li>
        ${h.rank ? `<li><strong>Where this area ranks:</strong> its median 2026 tax is higher than in ${Math.round(h.rank.below * 100)}% of ${h.rank.n} comparable areas, whose medians range from ${usd(h.range.lo)} to ${usd(h.range.hi)}.</li>` : ""}
        <li>Calculated by the Navigator from the 2026 roll, by the roll's subdivision ${cite("S30")}. Medians describe the area, not what this property should pay.</li>
      </ul>`;
  }

  /* ---------- ZIP home-value trend (line, crosshair + tooltip) ---------- */
  function zipChart(r, meta) {
    const box = $("#chart-zip"), head = $("#zip-title");
    const Z = meta && meta.zhvi, hit = Z && P().zipOf(r, meta);
    if (!hit || !hit.z || !hit.z.m || !Z.months) { head.textContent = "Home values in this ZIP"; box.innerHTML = `<p class="muted">No ZIP match for this parcel (about 14% of parcels have none), so there's no trend to show.</p>`; return; }
    head.textContent = `Typical home value, ZIP ${hit.zip}`;
    const [fy, fm] = Z.months.from.split("-").map(Number);
    const pts = hit.z.m.map((v, i) => ({ v, d: new Date(fy, fm - 1 + i, 1) })).filter(p => typeof p.v === "number");
    const W = Math.max(320, Math.round(box.clientWidth || 640)), H = 240, L = 58, R = 16, T = 18, B = 28;
    const lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v));
    const step = niceStep((hi - lo) / 3), y0 = Math.floor(lo / step) * step, y1 = Math.ceil(hi / step) * step;
    const n = hit.z.m.length, x = i => L + i / (n - 1) * (W - L - R), y = v => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
    const idx = d => (d.getFullYear() - fy) * 12 + d.getMonth() - (fm - 1);
    let g = "";
    for (let v = y0; v <= y1 + 1; v += step) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="tick" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">$${Math.round(v / 1000)}k</text>`;
    for (let yr = fy; yr <= pts[pts.length - 1].d.getFullYear(); yr++) { const i = idx(new Date(yr, 0, 1)); if (i >= 0 && i < n) g += `<text class="tick" x="${x(i)}" y="${H - 8}" text-anchor="middle">${yr}</text>`; }
    const bi = idx(new Date(2023, 0, 1));
    g += `<line class="marker" x1="${x(bi)}" x2="${x(bi)}" y1="${T}" y2="${H - B}"/><text class="marker-label" x="${x(bi) + 6}" y="${T + 10}">Roll values set (Jan. 2023)</text>`;
    const path = pts.map((p, k) => (k ? "L" : "M") + x(idx(p.d)).toFixed(1) + "," + y(p.v).toFixed(1)).join(" ");
    const last = pts[pts.length - 1];
    g += `<path class="line" d="${path}"/><circle class="dot-end" cx="${x(idx(last.d))}" cy="${y(last.v)}" r="4"/>`;
    g += `<g class="cross" visibility="hidden"><line x1="0" x2="0" y1="${T}" y2="${H - B}"/><circle r="4.5"/></g><rect class="zip-hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" tabindex="0"/>`;
    const fmtM = d => d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    box.innerHTML = `<div class="zip-stats"><div><span>Since Jan. 2023</span><strong>${spct(hit.z.chg)}</strong></div><div><span>${fmtM(last.d)}</span><strong>${usd(last.v)}</strong></div><div><span>Past year</span><strong>${spct(hit.z.yr)}</strong></div></div>
      <svg viewBox="0 0 ${W} ${H}" class="chart chart-wide" role="img" aria-label="Zillow typical home value in ZIP ${hit.zip}, monthly from ${fmtM(pts[0].d)} (${usd(pts[0].v)}) to ${fmtM(last.d)} (${usd(last.v)}); ${spct(hit.z.chg)} since January 2023.">${g}</svg>
      <p class="chart-note">Zillow Home Value Index for the ZIP's typical home ${cite("S40")}. It describes the area, never this property's value; roll values stay at their Jan. 1, 2023 level through tax year 2027 ${cite("S15")}.${hit.share < 0.6 ? " This census tract is split between ZIP codes, so check that this is yours." : ""}${r.approx ? " The ZIP comes from this parcel's approximate location." : ""}</p>`;
    const svg = box.querySelector("svg"), cross = svg.querySelector(".cross"), hitR = svg.querySelector(".zip-hit");
    const move = (clientX) => {
      const b = svg.getBoundingClientRect(), sx = (clientX - b.left) / b.width * W;
      const i = Math.max(0, Math.min(n - 1, Math.round((sx - L) / (W - L - R) * (n - 1))));
      const p = pts.find(q => idx(q.d) === i) || last;
      cross.setAttribute("visibility", "visible");
      cross.querySelector("line").setAttribute("x1", x(idx(p.d))); cross.querySelector("line").setAttribute("x2", x(idx(p.d)));
      cross.querySelector("circle").setAttribute("cx", x(idx(p.d))); cross.querySelector("circle").setAttribute("cy", y(p.v));
      showTip(`<strong>${fmtM(p.d)}</strong><br>${usd(p.v)}`, b.left + x(idx(p.d)) / W * b.width, b.top + y(p.v) / H * b.height);
      return i;
    };
    let ki = n - 1;
    hitR.addEventListener("pointermove", e => { ki = move(e.clientX); });
    hitR.addEventListener("pointerleave", () => { cross.setAttribute("visibility", "hidden"); hideTip(); });
    hitR.addEventListener("keydown", e => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault(); ki = Math.max(0, Math.min(n - 1, ki + (e.key === "ArrowRight" ? 1 : -1)));
      const b = svg.getBoundingClientRect(); move(b.left + x(ki) / W * b.width);
    });
  }
  let resizeT;
  window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (S.base) zipChart(S.base, S.meta); }, 200); });
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }

  /* ---------- Map (Leaflet + CARTO tiles, loaded on first use) ---------- */
  let leafletP = null;
  function loadLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (leafletP) return leafletP;
    leafletP = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet"; css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(css);
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      s.onload = () => (window.L && window.L.map ? resolve(window.L) : reject(new Error("no leaflet")));
      s.onerror = () => reject(new Error("leaflet blocked"));
      document.head.appendChild(s);
      setTimeout(() => reject(new Error("timeout")), 9000);
    });
    leafletP.catch(() => { leafletP = null; });
    return leafletP;
  }
  const dark = () => document.documentElement.getAttribute("data-theme") === "dark" ||
    (!document.documentElement.getAttribute("data-theme") && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
  // OpenStreetMap's standard tiles (free with attribution); dark mode darkens them with a CSS filter (.map.dark).
  const tileUrl = () => "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  function mapFallback(r, why) {
    const q = encodeURIComponent(`${r.lat},${r.lon}`);
    const mini = $("#mini-map"); if (mini) mini.innerHTML = `<div class="map-fallback"><p>Map unavailable here</p></div>`;
    $("#map").innerHTML = `<div class="map-fallback"><p><strong>The map couldn't load here</strong>${why ? ` (${esc(why)})` : ""}.</p><p><a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">Open this parcel in Google Maps</a> · <a href="https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lon}#map=18/${r.lat}/${r.lon}" target="_blank" rel="noopener">OpenStreetMap</a></p></div>`;
  }
  const approxNote = r => {
    const a = r.approx;
    if (!a) return "";
    return a.kind === "street"
      ? `Approximate location: the data doesn't place this parcel, so the marker is at ${esc(title(a.from))}, the nearest house number on the same street (${a.gap} numbers away).`
      : `Approximate location: the data doesn't place this parcel, so the marker is at the center of its ${a.kind === "subdivision" ? "roll subdivision" : "ward"} (${a.n.toLocaleString("en-US")} located parcels).`;
  };
  async function drawMap(r, token) {
    const el = $("#map");
    $("#map-note").textContent = r.approx ? approxNote(r).replace(/<[^>]+>/g, "") : "Parcel positions from the roll's census match. Click a marker to compare it.";
    if (typeof r.lat !== "number") { el.innerHTML = `<div class="map-fallback"><p>This parcel has no map location in the data.</p></div>`; $("#map-legend").hidden = true; return; }
    $("#map-legend").hidden = false;
    syncMapTheme();
    let L;
    try { L = await loadLeaflet(); } catch (e) { if (token === S.token) mapFallback(r, "the map library is blocked or offline"); return; }
    if (token !== S.token) return;
    if (!S.map || !document.body.contains(S.map.getContainer())) {
      el.innerHTML = "";
      S.map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      S.tiles = L.tileLayer(tileUrl(), { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }).addTo(S.map);
      let errs = 0;
      S.tiles.on("tileerror", () => { if (++errs === 6) $("#map-note").textContent = "Map tiles are blocked here; the markers still show positions. Use the Google Maps link for streets."; });
    }
    if (S.layer) S.layer.remove();
    S.layer = L.layerGroup().addTo(S.map);
    const simIds = new Set(S.similar.map(x => x.id));
    const popup = x => `<strong>${esc(addr(x.a))}</strong><br>${esc(title(x.occ))} · market ${usd(x.tmv)} · 2026 tax ${usd(x.t26)}<br><button type="button" class="map-btn" data-dash="compare" data-id="${esc(x.id)}">${S.compare.includes(x.id) ? "In comparison" : "Compare"}</button>`;
    S.nearby.filter(x => x.dist <= 350 && !simIds.has(x.id) && x.id !== r.id).slice(0, 350).forEach(x =>
      L.circleMarker([x.lat, x.lon], { radius: 3.5, weight: 1, color: "#ffffff", fillColor: "#8a8f98", fillOpacity: .75 }).bindPopup(popup(x)).addTo(S.layer));
    S.similar.forEach(x => L.circleMarker([x.lat, x.lon], { radius: 7, weight: 2, color: "#ffffff", fillColor: "#c0841a", fillOpacity: 1 }).bindPopup(popup(x)).addTo(S.layer));
    L.circleMarker([r.lat, r.lon], { radius: r.approx ? 14 : 10, weight: 3, color: r.approx ? "#2f6db3" : "#ffffff", dashArray: r.approx ? "4 4" : null, fillColor: "#2f6db3", fillOpacity: r.approx ? .35 : 1 }).bindPopup(`<strong>${esc(addr(r.a))}</strong><br>This property${r.approx ? " (approximate location)" : ""}`).addTo(S.layer);
    drawMini(r, L);
    const pts = [[r.lat, r.lon]].concat(S.similar.map(x => [x.lat, x.lon]));
    S.map.invalidateSize();
    if (pts.length > 1) S.map.fitBounds(pts, { padding: [36, 36], maxZoom: 17 }); else S.map.setView([r.lat, r.lon], 17);
  }
  const syncMapTheme = () => { ["#map", "#mini-map"].forEach(s => { const m = $(s); if (m) m.classList.toggle("dark", dark()); }); };
  function drawMini(r, L) {
    const el = $("#mini-map");
    if (!el || typeof r.lat !== "number") return;
    if (S.mini) { try { S.mini.remove(); } catch (e) { /* old panel */ } S.mini = null; }
    el.innerHTML = "";
    el.classList.toggle("dark", dark());
    S.mini = L.map(el, { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, attributionControl: true });
    L.tileLayer(tileUrl(), { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OSM</a>' }).addTo(S.mini);
    L.circleMarker([r.lat, r.lon], { radius: r.approx ? 12 : 8, weight: 3, color: r.approx ? "#2f6db3" : "#ffffff", dashArray: r.approx ? "4 4" : null, fillColor: "#2f6db3", fillOpacity: r.approx ? .35 : 1 }).addTo(S.mini);
    S.similar.forEach(x => L.circleMarker([x.lat, x.lon], { radius: 5, weight: 2, color: "#ffffff", fillColor: "#c0841a", fillOpacity: 1 }).addTo(S.mini));
    S.mini.setView([r.lat, r.lon], r.approx && r.approx.kind !== "street" ? 15 : 16);
    if (r.approx) { const n = $("#mini-note"); if (n) n.textContent = "Approximate location · open map ↑"; }
  }
  new MutationObserver(syncMapTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- Similar properties (recommended) ---------- */
  function similarList(r) {
    const box = $("#similar");
    if (typeof r.lat !== "number") { box.innerHTML = `<p class="muted">No location for this parcel, so nearby matches can't be found. You can still add any property to the comparison: search it, then press <strong>Add to comparison</strong>.</p>`; return; }
    if (!S.similar.length) { box.innerHTML = `<p class="muted">No similar ${esc(title(r.occ || "parcels").toLowerCase())} within ${P().SIMILAR.radius / 1000} km with a market value within ${P().SIMILAR.valueBand * 100}%.</p>`; return; }
    box.innerHTML = `<ul class="sim-list">${S.similar.map(x => `<li>
        <div class="sim-main"><strong>${esc(addr(x.a))}</strong><span>${esc(title(x.occ))} · ${x.dist < 1000 ? Math.round(x.dist / 10) * 10 + " m" : (x.dist / 1000).toFixed(1) + " km"} away</span></div>
        <div class="sim-num"><span>Market value</span><strong>${usd(x.tmv)}</strong></div>
        <div class="sim-num"><span>2026 tax</span><strong>${usd(x.t26)}</strong></div>
        <div class="sim-act"><button type="button" class="btn ${S.compare.includes(x.id) ? "ghost added" : ""}" data-dash="compare" data-id="${esc(x.id)}" aria-pressed="${S.compare.includes(x.id)}">${S.compare.includes(x.id) ? "✓ Comparing" : "Compare"}</button>
        <button type="button" class="link-plain" data-dash="open" data-id="${esc(x.id)}">Open</button></div></li>`).join("")}</ul>
      ${r.approx ? `<p class="chart-note"><strong>Distances are from this parcel's approximate location.</strong></p>` : ""}<p class="chart-note">Recommended by the Navigator: same property type, market value within ${P().SIMILAR.valueBand * 100}%, within ${P().SIMILAR.radius / 1000} km, closest match first, from the 2026 roll ${cite("S30")}. Not an appraisal; the roll doesn't record size or condition.</p>`;
  }

  /* ---------- Compare (this property + up to three) ---------- */
  async function compareTable() {
    const box = $("#compare-table"), r = S.base;
    $("#compare-count").textContent = S.compare.length ? `${S.compare.length} of ${MAX_COMPARE} added` : "";
    if (!r) return;
    const lk = bot() && bot().lookup;
    const others = (await Promise.all(S.compare.filter(id => id !== r.id).map(id => lk.byId(id).catch(() => null)))).filter(Boolean);
    const cols = [r].concat(others).map(x => P().compareRecord(x, S.meta));
    if (cols.length === 1) {
      box.innerHTML = `<p class="muted">Pick up to ${MAX_COMPARE} properties to put beside this one: press <strong>Compare</strong> on a recommendation above or on the map, or search any address and press <strong>Add to comparison</strong>.</p>`;
      return;
    }
    const dist = c => (c.id === r.id || typeof c.lat !== "number" || typeof r.lat !== "number") ? "—" : (d => d < 1000 ? Math.round(d / 10) * 10 + " m" : (d / 1000).toFixed(1) + " km")(lk.metres(r.lat, r.lon, c.lat, c.lon));
    const best = (key, low) => { if (!low) return null; const v = cols.map(c => c[key]).filter(x => typeof x === "number"); return v.length > 1 && Math.min(...v) !== Math.max(...v) ? Math.min(...v) : null; };
    const rows = [
      ["Property type", c => esc(title(c.occ))],
      ["Neighborhood (roll)", c => esc(title(c.sub)) || "—"],
      ["Year built", c => esc(c.yb) || "—"],
      ["Distance", dist],
      ["Market value", c => usd(c.tmv), "tmv"],
      ["Assessed value", c => usd(c.tav), "tav"],
      ["Homestead", c => c.hs ? usd(c.hs) : "None"],
      ["Taxable value", c => usd(c.tx), "tx"],
      ["2026 tax", c => usd(c.t26), "t26", true],
      ["2027 tax (as filed)", c => c.t27 == null ? "—" : usd(c.t27), "t27", true],
      ["Tax per $1,000 of market value", c => c.per1k == null ? "—" : usd2(c.per1k), "per1k", true],
      ["Assessment freeze", c => c.fz ? "Yes" : "No"],
      ["ZIP (approx.) · change since Jan. 2023", c => c.zip ? `${esc(c.zip)} · ${spct(c.zipChg)}` : "—"]
    ];
    box.innerHTML = `<div class="cmp-scroll"><table class="cmp">
      <thead><tr><th scope="col"><span class="sr-only">Field</span></th>${cols.map((c, i) => `<th scope="col"${i ? "" : ' class="cmp-base"'}>
        <span class="cmp-tag">${i ? "Comparison " + i : "Your property"}</span><span class="cmp-addr">${esc(addr(c.a))}</span>
        ${i ? `<span class="cmp-acts"><button type="button" class="link-plain" data-dash="open" data-id="${esc(c.id)}">Open</button><button type="button" class="link-plain" data-dash="remove" data-id="${esc(c.id)}" aria-label="Remove ${esc(addr(c.a))} from comparison">Remove</button></span>` : ""}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(([label, f, key, low]) => {
        const b = key ? best(key, low) : null;
        return `<tr><th scope="row">${label}</th>${cols.map((c, i) => `<td${i ? "" : ' class="cmp-base"'}${b !== null && c[key] === b ? ' data-best="1"' : ""}>${f(c)}</td>`).join("")}</tr>`;
      }).join("")}</tbody></table></div>
      <p class="chart-note">All values from the 2026 roll and the 2027 roll as filed ${cite("S30")}${cite("S31")}; ZIP trend from Zillow ${cite("S40")}. Lowest tax figures are marked. "Tax per $1,000 of market value" is calculated (2026 tax ÷ market value × 1,000); homestead and freezes make it differ between similar homes. This compares records; it isn't advice about any property's value.</p>`;
  }

  function saveCompare() { store.set("nola-compare", S.compare); }
  function toggleCompare(id) {
    if (S.base && id === S.base.id) return;
    const i = S.compare.indexOf(id);
    if (i >= 0) S.compare.splice(i, 1);
    else {
      if (S.compare.length >= MAX_COMPARE) { toastMsg(`You can compare up to ${MAX_COMPARE} properties with yours. Remove one first.`); return; }
      S.compare.push(id);
    }
    saveCompare();
    refreshCompareUI();
  }
  function refreshCompareUI() {
    if (!S.base) return;
    similarList(S.loc || S.base);
    compareTable();
    const pin = $("#pin-compare");
    if (pin) { const on = S.compare.includes(S.base.id); pin.textContent = on ? "✓ Kept for comparison" : "Add to comparison"; pin.setAttribute("aria-pressed", String(on)); }
    if (S.map && S.base) S.map.closePopup();
  }
  function toastMsg(m) { const t = $("#toast"); if (!t) return; t.textContent = m; t.hidden = false; t.classList.add("show"); clearTimeout(toastMsg.t); toastMsg.t = setTimeout(() => { t.classList.remove("show"); setTimeout(() => { t.hidden = true; }, 250); }, 2600); }

  /* ---------- Lifecycle ---------- */
  async function render(r, meta) {
    const token = ++S.token;
    S.base = r; S.meta = meta || (bot() && bot().meta && bot().meta());
    // A property you compare *with* shouldn't also sit in its own comparison.
    const dash = $("#dash");
    dash.hidden = false;
    const feat = $(".features"); if (feat) feat.hidden = true;
    document.querySelectorAll("[data-dash-link]").forEach(a => { a.hidden = false; });
    $("#dash-addr").textContent = addr(r.a);
    $("#dash-meta").textContent = `Parcel ${r.id} · ${title(String(r.occ || "").split("|")[0])}${r.sub ? " · " + title(r.sub) : ""}`;
    const bill = $("#dash-bill"); if (bill && window.NavigatorUI) bill.href = NavigatorUI.billUrl(r.id, 2026);
    taxHistoryChart(r);
    const mh = $("#mini-hist"); if (mh) taxHistoryChart(r, mh);
    breakdownChart(r, S.meta);
    hoodTile(r, S.meta);
    let loc = r;
    if (typeof r.lat !== "number" && bot() && bot().lookup && bot().lookup.approx) {
      try { const ap = await bot().lookup.approx(r); if (ap) loc = Object.assign({}, r, { lat: ap.lat, lon: ap.lon, bg: r.bg || ap.bg, approx: ap }); } catch (e) { /* no estimate */ }
      if (token !== S.token) return;
    }
    S.loc = loc;
    zipChart(loc, S.meta);
    $("#similar").innerHTML = `<p class="muted">Finding similar properties nearby…</p>`;
    const pin = $("#pin-compare"); if (pin) { const on = S.compare.includes(r.id); pin.textContent = on ? "✓ Kept for comparison" : "Add to comparison"; pin.setAttribute("aria-pressed", String(on)); }
    compareTable();
    S.nearby = []; S.similar = [];
    if (typeof loc.lat === "number" && bot() && bot().lookup) {
      try { S.nearby = await bot().lookup.near(loc.lat, loc.lon, P().SIMILAR.radius); } catch (e) { S.nearby = []; }
      if (token !== S.token) return;
      S.similar = P().similar(r, S.nearby, 5);
    }
    similarList(loc);
    drawMap(loc, token);
    if (S.pending) { const t = S.pending; S.pending = null; setTimeout(() => goTile(t), 150); }
    else if (window.NavigatorUI && NavigatorUI.fromFind && Date.now() - NavigatorUI.fromFind < 120000) { NavigatorUI.fromFind = 0; setTimeout(() => goTile("top"), 150); }
    else if (window.NavigatorUI && !S.toldOnce) { S.toldOnce = true; NavigatorUI.toast("Property dashboard is open at the top: map, charts, similar homes ↑"); }
  }

  // Sample dashboard: open the example property and bring the asked-for tile into view.
  const TILE = { top: "#dash", map: ".tile-map", hist: "#hist-title", hood: "#hood-title", sim: "#sim-title", bill: "#dash" };
  function goTile(t) {
    const el = $(TILE[t] || "#dash");
    if (!el) return;
    (el.closest(".tile") || el).scrollIntoView({ behavior: "smooth", block: "start" });
    const tile = el.closest(".tile");
    if (tile) { tile.classList.add("flash"); setTimeout(() => tile.classList.remove("flash"), 1600); }
    if (t === "bill") { const b = $("#dash-bill"); if (b) { b.classList.add("flash"); setTimeout(() => b.classList.remove("flash"), 1600); } }
  }
  function openSample(t) {
    const id = "102000079";
    if (S.base && S.base.id === id && !$("#dash").hidden) { goTile(t); return; }
    S.pending = t || "top";
    if (window.NavigatorUI) NavigatorUI.findProperty(id, true);
  }
  function clear() {
    S.token++; S.base = null;
    const dash = $("#dash"); if (dash) dash.hidden = true;
    const feat = $(".features"); if (feat) feat.hidden = false;
    document.querySelectorAll("[data-dash-link]").forEach(a => { a.hidden = true; });
  }

  function init() {
    document.addEventListener("nav:select", e => { if (e.detail && e.detail.record) render(e.detail.record, e.detail.meta); });
    document.addEventListener("nav:clear", clear);
    document.addEventListener("click", e => {
      const b = e.target.closest("[data-dash]");
      if (!b) return;
      const act = b.dataset.dash, id = b.dataset.id;
      if (act === "compare" && id) toggleCompare(id);
      if (act === "remove" && id) { S.compare = S.compare.filter(x => x !== id); saveCompare(); refreshCompareUI(); }
      if (act === "open" && id && window.NavigatorUI) window.NavigatorUI.findProperty(id, true);
      if (act === "pin" && S.base) {
        const i = S.compare.indexOf(S.base.id);
        if (i >= 0) S.compare.splice(i, 1);
        else if (S.compare.length >= MAX_COMPARE) { toastMsg(`You can keep up to ${MAX_COMPARE} properties. Remove one first.`); return; }
        else { S.compare.push(S.base.id); toastMsg("Kept. Now search another property; this one will sit beside it."); }
        saveCompare(); refreshCompareUI();
      }
      if (act === "clear-compare") { S.compare = []; saveCompare(); refreshCompareUI(); }
    });
    const sample = $("#sample-dash");
    if (sample) sample.addEventListener("click", () => openSample("top"));
    document.querySelectorAll("[data-sample]").forEach(b => b.addEventListener("click", () => openSample(b.dataset.sample)));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.NavigatorDash = { render, clear, state: S, openSample };
})();
