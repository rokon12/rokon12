#!/usr/bin/env bash
# Fetches the latest posts from the Substack RSS feed and writes them to _data/substack.json
# Usage: ./scripts/fetch-substack.sh

set -euo pipefail

FEED_URL="https://bazlur.substack.com/feed"
OUTPUT_FILE="_data/substack.json"
MAX_ITEMS=5

# Fetch RSS and extract items using python (available on ubuntu runners and most dev machines)
python3 - "$FEED_URL" "$OUTPUT_FILE" "$MAX_ITEMS" <<'PYEOF'
import sys
import json
import urllib.request
import xml.etree.ElementTree as ET
from html import unescape

feed_url = sys.argv[1]
output_file = sys.argv[2]
max_items = int(sys.argv[3])

req = urllib.request.Request(feed_url, headers={"User-Agent": "Jekyll-Build/1.0"})
with urllib.request.urlopen(req, timeout=15) as resp:
    xml_data = resp.read()

root = ET.fromstring(xml_data)
items = root.findall(".//item")

posts = []
for item in items[:max_items]:
    title = item.findtext("title", "").strip()
    link = item.findtext("link", "").strip()
    pub_date = item.findtext("pubDate", "").strip()
    # Extract a short description from dc:description or description
    desc = item.findtext("description", "").strip()
    # Strip HTML tags for a plain-text snippet
    import re
    desc_plain = unescape(re.sub(r"<[^>]+>", "", desc))
    # Truncate to ~120 chars
    if len(desc_plain) > 120:
        desc_plain = desc_plain[:117].rsplit(" ", 1)[0] + "..."
    posts.append({
        "title": unescape(title),
        "url": link,
        "date": pub_date,
        "description": desc_plain
    })

with open(output_file, "w") as f:
    json.dump(posts, f, indent=2)

print(f"Wrote {len(posts)} posts to {output_file}")
PYEOF
