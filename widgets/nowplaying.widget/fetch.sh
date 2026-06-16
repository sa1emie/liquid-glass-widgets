#!/bin/bash
# Poll nowplaying-cli for system MediaRemote state.
# Outputs compact JSON or {hidden:true} when nothing is playing.
set -u
BIN="$HOME/.local/bin/nowplaying-cli"

if [[ ! -x "$BIN" ]]; then
  printf '{"error":"missing_binary","detail":"Install: mkdir -p ~/.local/bin && curl -fsSL -o ~/.local/bin/nowplaying-cli https://github.com/kirtan-shah/nowplaying-cli/releases/download/v2.1.0/nowplaying-cli && chmod +x ~/.local/bin/nowplaying-cli"}\n'
  exit 0
fi

RAW=$("$BIN" get-raw 2>/dev/null)
if [[ -z "$RAW" ]] || [[ "$RAW" == "nil" ]]; then
  printf '{"hidden":true}\n'
  exit 0
fi

# Convert NSDictionary plist-ish output to JSON. nowplaying-cli emits property-list.
# Use plutil to convert plist → json.
JSON=$(printf '%s' "$RAW" | /usr/bin/plutil -convert json -o - - 2>/dev/null)
if [[ -z "$JSON" ]]; then
  printf '{"hidden":true}\n'
  exit 0
fi

# Strip artworkData (large base64) — we write it to a tmp file and reference its path.
ART_TMP=""
ART_DATA=$(printf '%s' "$JSON" | /usr/bin/jq -r '.kMRMediaRemoteNowPlayingInfoArtworkData // empty')
if [[ -n "$ART_DATA" ]]; then
  ART_TMP="/tmp/nowplaying-art.jpg"
  printf '%s' "$ART_DATA" | /usr/bin/base64 -d > "$ART_TMP" 2>/dev/null || ART_TMP=""
fi

printf '%s' "$JSON" | /usr/bin/jq --arg art "$ART_TMP" -c '{
  title: (.kMRMediaRemoteNowPlayingInfoTitle // ""),
  artist: (.kMRMediaRemoteNowPlayingInfoArtist // ""),
  album: (.kMRMediaRemoteNowPlayingInfoAlbum // ""),
  duration: (.kMRMediaRemoteNowPlayingInfoDuration // 0),
  elapsed: (.kMRMediaRemoteNowPlayingInfoElapsedTime // 0),
  rate: (.kMRMediaRemoteNowPlayingInfoPlaybackRate // 0),
  artPath: $art
} | if .title == "" and .artist == "" then {hidden:true} else . end' 2>/dev/null || printf '{"hidden":true}\n'
