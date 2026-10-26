#!/usr/bin/env bash
# Refresh the data snapshots used by index.html.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p data
echo "Fetching Specref W3C references…"
curl -sSL -o data/w3c.json "https://raw.githubusercontent.com/tobie/specref/main/refs/w3c.json"
echo "Fetching W3C group names…"
python3 - <<'EOF'
import json, urllib.request
groups, page = {}, 1
while True:
    d = json.load(urllib.request.urlopen(f"https://api.w3.org/groups?embed=1&items=500&page={page}"))
    for g in d.get("_embedded", {}).get("groups", []):
        entry = {"name": g.get("name"), "type": g.get("type"), "short": g.get("fullshortname"), "closed": g.get("is_closed")}
        hp = (g.get("_links", {}).get("homepage") or {}).get("href")
        if hp: groups[hp.rstrip("/") + "/"] = entry
        if g.get("fullshortname"): groups[f"https://www.w3.org/groups/{g['fullshortname']}/"] = entry
    if page >= int(d.get("pages") or 1): break
    page += 1
json.dump(groups, open("data/groups.json", "w"))
print(f"{len(groups)} group URLs mapped")
EOF
ls -la data/
