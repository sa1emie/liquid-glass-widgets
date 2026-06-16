#!/bin/bash
# Open Tarteel to a specific ayah. Best-effort: try deep link, fall back to launching app.
SURAH="$1"
AYAH="$2"

# Try the most likely deep-link formats. `open` only fails if no handler is registered.
# Tarteel registers `tarteel://` so the first call always succeeds even if the path is unknown;
# in that case Tarteel just opens to its home screen, which is the same as fallback #2.
if /usr/bin/open "tarteel://ayah/${SURAH}:${AYAH}" 2>/dev/null; then exit 0; fi
if /usr/bin/open -a Tarteel 2>/dev/null; then exit 0; fi
/usr/bin/open "https://quranflash.com/" 2>/dev/null
