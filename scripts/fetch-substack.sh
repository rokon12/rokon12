#!/usr/bin/env bash
# Fetches the latest posts from the Substack RSS feed and writes them to _data/substack.json
# Usage: ./scripts/fetch-substack.sh
# Falls back gracefully — the build continues even if the fetch fails.

set -uo pipefail

FEED_URL="https://bazlur.substack.com/feed"
OUTPUT_FILE="_data/substack.json"
MAX_ITEMS=5
TMP_FILE=$(mktemp)

# Use curl with a browser-like User-Agent to avoid 403 from Substack
if ! curl -fsSL --max-time 15 \
  -H "User-Agent: Mozilla/5.0 (compatible; JekyllBuild/1.0)" \
  -H "Accept: application/rss+xml, application/xml, text/xml" \
  -o "$TMP_FILE" "$FEED_URL"; then
  echo "Warning: Failed to fetch Substack feed. Using existing $OUTPUT_FILE if available."
  rm -f "$TMP_FILE"
  exit 0
fi

# Parse the fetched RSS XML with python
python3 - "$TMP_FILE" "$OUTPUT_FILE" "$MAX_ITEMS" <<'PYEOF'
import sys
import json
import re
import xml.etree.ElementTree as ET
from html import unescape

tmp_file = sys.argv[1]
output_file = sys.argv[2]
max_items = int(sys.argv[3])

with open(tmp_file, "rb") as f:
    xml_data = f.read()

root = ET.fromstring(xml_data)
items = root.findall(".//item")

posts = []
for item in items[:max_items]:
    title = item.findtext("title", "").strip()
    link = item.findtext("link", "").strip()
    pub_date = item.findtext("pubDate", "").strip()
    desc = item.findtext("description", "").strip()
    desc_plain = unescape(re.sub(r"<[^>]+>", "", desc))
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

rm -f "$TMP_FILE"
