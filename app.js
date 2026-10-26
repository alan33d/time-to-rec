/* Time-to-REC — W3C publication history explorer (TPAC 2026 hackathon prototype)
 * Data: Specref refs/w3c.json (all dated /TR versions) + W3C API group names.
 */

const SPECREF_URL = "https://raw.githubusercontent.com/tobie/specref/main/refs/w3c.json";
const REC_TRACK = new Set(["FPWD", "WD", "LCWD", "CR", "CRD", "PR", "PER", "REC"]);
const CR_LIKE = new Set(["CR", "CRD"]);
const NO_GROUP = "(no group recorded)";

// Legacy group homepage → human name (the W3C API only knows current groups).
const LEGACY_GROUPS = {
  "Style/CSS/": "CSS WG", "International/core/": "Internationalization WG",
  "International/i18n-activity/i18n-wg/": "Internationalization WG", "International/its/": "ITS IG",
  "XML/Query/": "XML Query WG", "Style/XSL/": "XSL WG", "Graphics/SVG/WG/": "SVG WG", "Voice/": "Voice Browser WG",
  "2008/xmlsec/": "XML Security WG", "2008/webapps/": "Web Applications WG", "XML/Core/": "XML Core WG",
  "WAI/GL/": "Accessibility Guidelines WG", "html/wg/": "HTML WG", "MarkUp/": "HTML WG", "MarkUp/Forms/": "Forms WG",
  "2002/mmi/": "Multimodal Interaction WG", "WAI/APA/": "APA WG", "2001/sw/DataAccess/": "SPARQL WG",
  "2000/xp/Group/": "XML Protocol WG", "DOM/Group/": "DOM WG", "2011/rdf-wg/": "RDF WG", "2007/OWL/": "OWL WG",
  "2005/rules/wg.html/": "RIF WG", "2011/prov/": "Provenance WG", "XML/Schema/": "XML Schema WG",
  "WebPlatform/WG/": "Web Platform WG", "2001/sw/BestPractices/": "SW Best Practices WG",
  "XML/Group/Linking/": "XML Linking WG", "WAI/ARIA/": "ARIA WG", "Social/WG/": "Social Web WG",
  "2011/gld/": "Gov. Linked Data WG", "2002/ws/desc/": "WS Description WG", "WAI/ER/": "Eval & Repair Tools WG",
  "2007/uwa/": "Ubiquitous Web Apps WG", "2005/MWI/BPWG/": "Mobile Web Best Practices WG", "XML/EXI/": "EXI WG",
  "WoT/WG/": "Web of Things WG", "AudioVideo/": "SYMM WG (SMIL)", "WAI/PF/": "Protocols & Formats WG",
  "2010/02/rdfa/": "RDFa WG", "Payments/WG/": "Web Payments WG", "2001/sw/WebOnt/": "Web Ontology WG",
  "2007/powder/": "POWDER WG", "2002/ws/ra/": "WS Resource Access WG", "2001/di/Group/": "Device Independence WG",
  "P3P/Group/Specification/": "P3P WG", "2012/sysapps/": "System Applications WG",
  "publishing/groups/publ-wg/": "Publishing WG", "2006/07/SWD/": "SW Deployment WG", "2013/csvw/": "CSV on the Web WG",
  "2001/sw/hcls/": "HCLS IG", "2012/ldp/": "Linked Data Platform WG", "groups/wg/auto/": "Automotive WG",
  "2004/CDF/": "Compound Document Formats WG", "2005/MWI/DDWG/": "Device Description WG", "Fonts/WG/": "WebFonts WG",
  "WAI/UA/": "UA Accessibility Guidelines WG", "annotation/": "Web Annotation WG", "dpub/IG/": "Digital Publishing IG",
  "groups/wg/miniapps/": "MiniApps WG", "QA/WG/": "QA WG", "XML/Processing/": "XML Processing Model WG",
  "WAI/AU/": "Authoring Tool Accessibility WG", "2001/sw/interest/": "Semantic Web IG", "2001/sw/RDFCore/": "RDF Core WG",
  "2001/sw/rdb2rdf/": "RDB2RDF WG", "2017/vc/": "Verifiable Credentials WG", "2002/ws/arch/": "WS Architecture WG",
  "2002/ws/policy/": "WS Policy WG", "Mobile/CCPP/Group/": "CC/PP WG", "2011/mbui/": "Model-Based UI WG",
  "2006/appformats/": "Web Application Formats WG", "2013/dwbp/": "Data on the Web BP WG", "2001/sw/grddl-wg/": "GRDDL WG",
  "2017/sdwig/": "Spatial Data on the Web IG", "XML/SML/": "SML WG", "2002/ws/addr/": "WS Addressing WG",
  "2002/ws/chor/": "WS Choreography WG", "XML/Group/Binary/": "XML Binary Characterization WG",
  "2012/webcrypto/": "Web Cryptography WG", "2008/geolocation/": "Geolocation WG", "WAI/IndieUI/": "IndieUI WG",
  "2008/WebVideo/Annotations/": "Media Annotations WG", "2008/WebVideo/Fragments/": "Media Fragments WG",
  "2016/poe/": "Permissions & Obligations WG", "2006/WSC/": "Web Security Context WG",
  "2011/audio/": "Audio WG", "2011/webrtc/": "WebRTC WG", "2011/webappsec/": "Web App Security WG",
  "2009/dap/": "Device APIs WG", "das/": "Devices and Sensors WG", "2010/webevents/": "Web Events WG",
  "Math/": "Math WG", "2019/did-wg/": "DID WG", "2017/vc/WG/": "Verifiable Credentials WG", "2001/tag/": "TAG",
  "2006/webapi/": "Web API WG", "2001/sw/": "Semantic Web Activity", "XML/": "XML Activity", "Mobile/": "Mobile Web Initiative",
  "2010/POI/": "Points of Interest WG", "Graphics/WebCGM/WG/": "WebCGM WG", "2007/xmlsec/": "XML Security WG",
};

function normUrl(u) { return (u || "").replace("http://", "https://").replace(/\/?$/, "/"); }

function groupName(url, groupMap) {
  const u = normUrl(url);
  if (groupMap && groupMap[u]) {
    const n = groupMap[u].name;
    if (/\(CSS\)/.test(n)) return "CSS WG";
    return n.replace(/ Working Group$/, " WG").replace(/ Interest Group$/, " IG").replace(/ Community Group$/, " CG");
  }
  const path = u.replace("https://www.w3.org/", "");
  if (LEGACY_GROUPS[path]) return LEGACY_GROUPS[path];
  // Fallback: readable path label
  return path.replace(/^groups\//, "").replace(/\/$/, "").replace(/\/(wg|WG|Group)$/, " WG") || "(unknown)";
}

function toDate(s) { // "20240913" or "2024-09-13"
  const m = String(s).match(/^(\d{4})-?(\d{2})-?(\d{2})$/);
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
}
const yearsBetween = (a, b) => (b - a) / (365.25 * 24 * 3600 * 1000);

/** Flatten Specref into one record per spec series + one per publication. */
function processSpecs(raw, groupMap) {
  const specs = [], pubs = [];
  for (const [key, e] of Object.entries(raw)) {
    if (!e || typeof e !== "object" || e.aliasOf || !e.versions) continue;
    const versions = Object.entries(e.versions)
      .map(([k, v]) => ({ date: toDate(v.rawDate || k), status: v.status || null, href: v.href, deliveredBy: v.deliveredBy }))
      .filter(v => v.date).sort((a, b) => a.date - b.date);
    if (!versions.length) continue;
    const firstOf = pred => { const v = versions.find(pred); return v ? v.date : null; };
    // A series' first publication *is* its FPWD (some series re-publish a later level as FPWD
    // under the same shortname, so "first version with status FPWD" can post-date the first REC).
    const first = versions[0].date;
    const fpwd = first;
    const rec = firstOf(v => v.status === "REC");
    const cr = firstOf(v => CR_LIKE.has(v.status) && (!rec || v.date <= rec));
    const pr = firstOf(v => v.status === "PR" && (!rec || v.date <= rec));
    const last = versions[versions.length - 1].date;
    const status = e.status || versions[versions.length - 1].status || "?";
    const gurl = (e.deliveredBy || [])[0] || ((versions.find(v => v.deliveredBy) || {}).deliveredBy || [])[0];
    const group = gurl ? groupName(gurl, groupMap) : NO_GROUP;
    const rec_track = REC_TRACK.has(status);
    const nonneg = v => (v == null || v < 0 ? null : v);
    specs.push({ key, title: e.title || key, href: e.href, group, status, first, fpwd, cr, pr, rec, last,
      n: versions.length, rec_track,
      fpwdToRec: nonneg(rec ? yearsBetween(fpwd, rec) : null),
      fpwdToCr: nonneg(cr ? yearsBetween(fpwd, cr) : null),
      crToRec: nonneg(cr && rec ? yearsBetween(cr, rec) : null),
      waiting: nonneg(!rec && rec_track ? yearsBetween(fpwd, new Date()) : null) });
    for (const v of versions) pubs.push({ date: v.date, status: v.status, key, title: e.title || key, group });
  }
  return { specs, pubs };
}

// ---------- Rendering (browser only) ----------
if (typeof document !== "undefined") (async function main() {
  const $ = s => document.querySelector(s);
  const status = msg => { $("#status").textContent = msg; };

  status("Loading Specref data…");
  // Data: inlined (standalone build) → compact snapshot → raw snapshot → live Specref on GitHub.
  const firstOk = async urls => { for (const u of urls) { try { const r = await fetch(u); if (r.ok) return await r.json(); } catch (e) { /* try next */ } } throw new Error("no data source reachable"); };
  const [raw, groupMap] = await Promise.all([
    window.__SPECREF__ || firstOk(["data/compact.json", "data/w3c.json", SPECREF_URL]),
    window.__GROUPS__ || firstOk(["data/groups.json"]).catch(() => ({})),
  ]);
  const { specs, pubs } = processSpecs(raw, groupMap);
  status("");

  const METRICS = {
    fpwdToRec: { label: "FPWD → REC", desc: "Years from First Public Working Draft to Recommendation (specs that reached REC)" },
    fpwdToCr:  { label: "FPWD → CR",  desc: "Years from First Public Working Draft to first Candidate Recommendation" },
    crToRec:   { label: "CR → REC",   desc: "Years spent in Candidate Recommendation before REC" },
    waiting:   { label: "Still waiting (FPWD → today)", desc: "Rec-track specs that have not reached REC yet: years since FPWD" },
  };
  const decade = d => `${Math.floor(d.getUTCFullYear() / 10) * 10}s`;
  const color = d3.scaleOrdinal().domain(["1990s", "2000s", "2010s", "2020s"]).range(["#9e9e9e", "#4e79a7", "#f28e2b", "#e15759"]);
  const fmtD = d3.utcFormat("%Y-%m-%d");

  // Headline numbers
  const recs = specs.filter(s => s.fpwdToRec != null);
  $("#headline").innerHTML = `
    <b>${specs.length.toLocaleString()}</b> spec series · <b>${pubs.length.toLocaleString()}</b> /TR publications since ${d3.min(pubs, p => p.date).getUTCFullYear()} ·
    <b>${recs.length}</b> reached REC · median FPWD→REC <b>${d3.median(recs, s => s.fpwdToRec).toFixed(1)} years</b>
    (fastest ${d3.min(recs, s => s.fpwdToRec).toFixed(1)}, slowest ${d3.max(recs, s => s.fpwdToRec).toFixed(1)})`;

  // Controls
  const sel = $("#metric");
  for (const [k, m] of Object.entries(METRICS)) sel.append(new Option(m.label, k));
  sel.addEventListener("change", drawSwarm);
  $("#topn").addEventListener("input", drawSwarm);
  $("#search").addEventListener("input", drawSwarm);

  const tip = d3.select("#tip");
  const showTip = (ev, html) => tip.style("display", "block").style("left", ev.pageX + 12 + "px").style("top", ev.pageY + 12 + "px").html(html);
  const hideTip = () => tip.style("display", "none");

  /** Symmetric 1-D beeswarm dodge (x in px) → y offsets. */
  function dodge(items, radius, x) {
    const r2 = (2 * radius) ** 2, eps = 1e-3;
    const circles = items.map(d => ({ x: x(d), data: d })).sort((a, b) => a.x - b.x);
    let head = null, tail = null;
    const intersects = (x, y) => { for (let a = head; a; a = a.next) if (r2 - eps > (a.x - x) ** 2 + (a.y - y) ** 2) return true; return false; };
    for (const b of circles) {
      while (head && head.x < b.x - 2 * radius) head = head.next;
      if (intersects(b.x, b.y = 0)) {
        b.y = Infinity;
        for (let a = head; a; a = a.next) {
          const dy = Math.sqrt(Math.max(0, r2 - (a.x - b.x) ** 2));
          for (const y of [a.y + dy, a.y - dy]) if (Math.abs(y) < Math.abs(b.y) && !intersects(b.x, y)) b.y = y;
        }
        if (!isFinite(b.y)) b.y = 0;
      }
      b.next = null;
      if (!head) head = tail = b; else tail = tail.next = b;
    }
    return circles;
  }

  function drawSwarm() {
    const metric = sel.value, topN = +$("#topn").value, q = $("#search").value.trim().toLowerCase();
    $("#topn-val").textContent = topN;
    $("#metric-desc").textContent = METRICS[metric].desc;
    const data = specs.filter(s => s[metric] != null);
    const byGroup = d3.rollups(data, v => v, d => d.group).sort((a, b) => b[1].length - a[1].length);
    const named = byGroup.filter(g => g[0] !== NO_GROUP);
    const top = named.slice(0, topN);
    const rest = named.slice(topN).concat(byGroup.filter(g => g[0] === NO_GROUP)).flatMap(g => g[1]);
    const rows = top.map(([g, v]) => ({ group: g, specs: v }));
    rows.forEach(r => r.median = d3.median(r.specs, d => d[metric]));
    rows.sort((a, b) => a.median - b.median);
    if (rest.length) { // keep the catch-all row at the bottom
      const other = { group: `All other groups (${byGroup.length - top.length})`, specs: rest };
      other.median = d3.median(rest, d => d[metric]);
      rows.push(other);
    }

    const W = Math.max(900, $("#swarm").parentElement.clientWidth), margin = { top: 28, right: 30, bottom: 36, left: 230 }, r = 3.6;
    const x = d3.scaleLinear().domain([0, d3.max(data, d => d[metric]) * 1.02]).nice().range([margin.left, W - margin.right]);
    rows.forEach(row => { row.pts = dodge(row.specs, r, d => x(d[metric])); row.h = Math.max(34, 2 * d3.max(row.pts, p => Math.abs(p.y)) + 2 * r + 10); });
    const H = margin.top + d3.sum(rows, d => d.h) + margin.bottom;

    const svg = d3.select("#swarm").attr("width", W).attr("height", H).html("");
    svg.append("g").attr("transform", `translate(0,${margin.top - 6})`).call(d3.axisTop(x).ticks(12).tickFormat(d => d + "y"))
      .call(g => g.selectAll(".tick line").clone().attr("y2", H - margin.top - margin.bottom + 6).attr("stroke-opacity", 0.07));
    svg.append("text").attr("x", W - margin.right).attr("y", H - 8).attr("text-anchor", "end").attr("class", "axis-label").text(METRICS[metric].label + " (years)");

    let y0 = margin.top;
    for (const row of rows) {
      const cy = y0 + row.h / 2;
      const g = svg.append("g").attr("transform", `translate(0,${cy})`);
      g.append("line").attr("x1", margin.left).attr("x2", W - margin.right).attr("stroke", "#eee");
      g.append("text").attr("x", margin.left - 10).attr("y", 4).attr("text-anchor", "end").attr("class", "row-label")
        .text(row.group.length > 32 ? row.group.slice(0, 31) + "…" : row.group).append("title").text(row.group);
      g.append("text").attr("x", margin.left - 10).attr("y", 17).attr("text-anchor", "end").attr("class", "row-sub")
        .text(`n=${row.specs.length} · median ${row.median.toFixed(1)}y`);
      g.selectAll("circle").data(row.pts).join("circle")
        .attr("cx", p => p.x).attr("cy", p => p.y).attr("r", r)
        .attr("fill", p => color(decade(p.data.fpwd)))
        .attr("fill-opacity", p => !q || (p.data.title + p.data.key).toLowerCase().includes(q) ? 0.85 : 0.08)
        .attr("stroke", p => q && (p.data.title + p.data.key).toLowerCase().includes(q) ? "#000" : "none")
        .style("cursor", "pointer")
        .on("mousemove", (ev, p) => showTip(ev, `<b>${p.data.title}</b><br>${p.data.group} · ${p.data.status}<br>
            FPWD ${fmtD(p.data.fpwd)}${p.data.cr ? " · CR " + fmtD(p.data.cr) : ""}${p.data.rec ? " · REC " + fmtD(p.data.rec) : ""}<br>
            <b>${p.data[metric].toFixed(1)} years</b> · ${p.data.n} publications`))
        .on("mouseleave", hideTip)
        .on("click", (ev, p) => window.open(p.data.href, "_blank"));
      g.append("line").attr("x1", x(row.median)).attr("x2", x(row.median)).attr("y1", -row.h / 2 + 4).attr("y2", row.h / 2 - 4)
        .attr("stroke", "#222").attr("stroke-width", 2).attr("stroke-dasharray", "3,2");
      y0 += row.h;
    }
    d3.select("#legend").html(color.domain().map(d => `<span class="sw" style="background:${color(d)}"></span>FPWD in the ${d}`).join(" &nbsp; ") + " &nbsp; <span class='sw' style='background:none;border-left:2px dashed #222;width:0'></span> group median");
  }

  function drawHeatmap() {
    const week = d3.utcFormat("%V");
    const counts = d3.rollup(pubs, v => v.length, p => p.date.getUTCFullYear(), p => +week(p.date));
    const years = d3.range(d3.min(pubs, p => p.date.getUTCFullYear()), new Date().getUTCFullYear() + 1);
    const cell = 13, gap = 2, left = 50, top = 24;
    const W = left + 53 * (cell + gap) + 20, H = top + years.length * (cell + gap) + 10;
    const max = d3.max(Array.from(counts.values(), m => d3.max(m.values())));
    const col = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, Math.min(max, 40)]).clamp(true);
    const svg = d3.select("#heat").attr("width", W).attr("height", H).html("");
    svg.append("g").selectAll("text").data(d3.range(1, 54, 4)).join("text").attr("x", w => left + (w - 1) * (cell + gap)).attr("y", top - 8).attr("class", "axis-label").text(w => "wk " + w);
    const rows = svg.selectAll("g.row").data(years).join("g").attr("class", "row").attr("transform", (y, i) => `translate(0,${top + i * (cell + gap)})`);
    rows.append("text").attr("x", left - 8).attr("y", cell - 2).attr("text-anchor", "end").attr("class", "row-sub").text(y => y);
    rows.selectAll("rect").data(y => d3.range(1, 54).map(w => ({ y, w, n: (counts.get(y) && counts.get(y).get(w)) || 0 }))).join("rect")
      .attr("x", d => left + (d.w - 1) * (cell + gap)).attr("width", cell).attr("height", cell).attr("rx", 2)
      .attr("fill", d => d.n ? col(d.n) : "#f1f1f1")
      .on("mousemove", (ev, d) => showTip(ev, `<b>${d.y}, week ${d.w}</b><br>${d.n} publication${d.n === 1 ? "" : "s"}`))
      .on("mouseleave", hideTip);
    const perYear = d3.rollups(pubs, v => v.length, p => p.date.getUTCFullYear()).sort((a, b) => b[1] - a[1]);
    $("#heat-note").textContent = `Busiest year: ${perYear[0][0]} (${perYear[0][1]} publications). Each cell is one ISO week; darker = more /TR publications (all maturity levels).`;
  }

  function drawShame() {
    const since = +$("#since").value;
    const waiting = specs.filter(s => s.waiting != null && s.fpwd.getUTCFullYear() >= since).sort((a, b) => a.fpwd - b.fpwd).slice(0, 15);
    $("#shame tbody").innerHTML = waiting.map((s, i) => `<tr>
      <td>${i + 1}</td><td><a href="${s.href}" target="_blank">${s.title}</a></td><td>${s.group}</td><td><code>${s.status}</code></td>
      <td>${fmtD(s.fpwd)}</td><td>${fmtD(s.last)}</td><td><b>${s.waiting.toFixed(1)}</b></td></tr>`).join("");
  }
  $("#since").addEventListener("change", drawShame);

  // Shareable state: ?metric=waiting&groups=25&q=audio
  const params = new URLSearchParams(location.search);
  if (params.get("q")) $("#search").value = params.get("q");
  if (METRICS[params.get("metric")]) sel.value = params.get("metric");
  if (+params.get("groups")) $("#topn").value = +params.get("groups");

  drawSwarm(); drawHeatmap(); drawShame();
  window.addEventListener("resize", drawSwarm);
})().catch(err => { document.querySelector("#status").textContent = "Failed to load data: " + err; console.error(err); });

if (typeof module !== "undefined") module.exports = { processSpecs, groupName, toDate };
