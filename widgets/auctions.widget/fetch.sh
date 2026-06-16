#!/bin/bash
# Run auction.py --json at most once per 24h. Cache only meaningful (>0) results so
# an empty run doesn't blow away yesterday's hits.
set -u
CACHE="$HOME/.config/auction-widget/last-hit.json"
RUNSTAMP="$HOME/.config/auction-widget/.last-run"
SCRIPT="$HOME/Desktop/projects/car/auction.py"
mkdir -p "$(/usr/bin/dirname "$CACHE")"

serve_cache_or_hide() {
  if [[ -s "$CACHE" ]] && [[ -z "$(/usr/bin/find "$CACHE" -mtime +1 2>/dev/null)" ]]; then
    /bin/cat "$CACHE"
  else
    printf '{"new_count":0,"matches":[]}\n'
  fi
}

# Debounce: only re-run the auction script if we haven't in the last 24h.
SHOULD_RUN=1
if [[ -f "$RUNSTAMP" ]] && [[ -z "$(/usr/bin/find "$RUNSTAMP" -mtime +1 2>/dev/null)" ]]; then
  SHOULD_RUN=0
fi

if [[ "$SHOULD_RUN" == "0" ]]; then
  serve_cache_or_hide
  exit 0
fi

# Run.
RESULT=$(/usr/bin/python3 "$SCRIPT" --json 2>/dev/null)
/usr/bin/touch "$RUNSTAMP"

NEW_COUNT=$(printf '%s' "$RESULT" | /usr/bin/jq -r '.new_count // 0' 2>/dev/null)
if [[ -n "$NEW_COUNT" ]] && [[ "$NEW_COUNT" -gt 0 ]]; then
  printf '%s' "$RESULT" > "$CACHE"
fi

serve_cache_or_hide
