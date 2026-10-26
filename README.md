# Time-to-REC — how long do W3C specs take?

**Live: <https://alan33d.github.io/time-to-rec/>**

A single-page visualization of **30 years of W3C /TR publication history**, built for the
[W3C TPAC 2026 hackathon](https://www.w3.org/2026/10/TPAC/hackathon/) (Challenge 01: visualize standards data).

* **Beeswarm by group** — every dot is a spec series; x = years spent in a stage
  (FPWD→REC, FPWD→CR, CR→REC, or "still waiting"). Rows are groups, sorted by median; dashed line = group median.
  Dot colour = decade of first publication. Hover for dates, click to open the spec. Type in *Highlight* to spotlight specs (e.g. `audio`).
* **Calendar heatmap** — number of /TR publications per ISO week, 1996 → today (spot the Echidna auto-publishing era).
* **Still waiting** — oldest rec-track specs that never reached REC.

## Run it

```sh
./fetch-data.sh                # optional: refresh data/w3c.json + data/groups.json
python3 -m http.server 8000    # any static server works
open http://localhost:8000/
```

No build step, no framework: `index.html` + `app.js` + [D3 v7](https://d3js.org/) from a CDN.
If `data/w3c.json` is missing, the page fetches Specref directly from GitHub.

**Single-file version (no server needed):** `python3 build-standalone.py` writes `dist/time-to-rec.html`
(~1.6 MB, D3 + compacted data inlined). Double-click it, email it, or attach it to the submission.

## Data

| Source | Used for |
|---|---|
| [Specref `refs/w3c.json`](https://github.com/tobie/specref/blob/main/refs/w3c.json) | Every dated /TR version with maturity status (`FPWD`, `WD`, `CR`, `CRD`, `PR`, `REC`, `NOTE`, …) and delivering group |
| [W3C API `/groups`](https://api.w3.org/groups) | Group names for current groups; legacy group homepages are mapped by a small table in `app.js` |

Method: for each spec series, FPWD = first publication, CR = first `CR`/`CRD` at or before the first `REC`, REC = first `REC`.
Series that never reached REC and whose current status is on the Recommendation track count as "still waiting".

## Caveats (it's a 90-minute hackathon project)

* Specref keys series by shortname; levels that share a shortname are one series.
* Pre-2000 specs often predate the FPWD label; their first WD is used.
* Abandoned 1990s drafts were never formally discontinued, so they show as "still waiting" unless you filter by year.
