#!/usr/bin/env python3
"""Build dist/time-to-rec.html: one self-contained file (D3 + compacted data + app) that works from file://."""
import json, os, re, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)

# 1. Compact the Specref data to just the fields app.js reads (12 MB → ~1 MB).
raw = json.load(open(os.path.join(ROOT, "data/w3c.json")))
compact = {}
for key, e in raw.items():
    if not isinstance(e, dict) or e.get("aliasOf") or not e.get("versions"):
        continue
    compact[key] = {
        "title": e.get("title"), "href": e.get("href"), "status": e.get("status"), "deliveredBy": e.get("deliveredBy"),
        "versions": {k: {"status": v.get("status"), "rawDate": v.get("rawDate")} for k, v in e["versions"].items()},
    }
groups = json.load(open(os.path.join(ROOT, "data/groups.json")))
# Also save the compact dataset for the served page (keeps the repo / Pages payload small).
json.dump(compact, open(os.path.join(ROOT, "data/compact.json"), "w"), separators=(",", ":"))

# 2. D3 (cached locally after first download).
d3_path = os.path.join(ROOT, "dist/d3.min.js")
if not os.path.exists(d3_path):
    urllib.request.urlretrieve("https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js", d3_path)
d3_src = open(d3_path, encoding="utf-8").read()
app_src = open(os.path.join(ROOT, "app.js"), encoding="utf-8").read()
html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()

def inline(js):  # keep the HTML parser from ending the script early
    return js.replace("</script>", "<\\/script>")

data_js = "window.__SPECREF__=" + json.dumps(compact, separators=(",", ":")) + ";window.__GROUPS__=" + json.dumps(groups, separators=(",", ":")) + ";"
html = html.replace('<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>', "<script>" + inline(d3_src) + "</script>")
html = html.replace('<script src="app.js"></script>', "<script>" + inline(data_js) + "</script>\n<script>" + inline(app_src) + "</script>")
assert "app.js" not in re.findall(r'<script src="[^"]+"', html), "script tag not inlined"

out = os.path.join(ROOT, "dist/time-to-rec.html")
open(out, "w", encoding="utf-8").write(html)
print(f"wrote {out} ({os.path.getsize(out) / 1e6:.1f} MB; {len(compact)} spec series)")
