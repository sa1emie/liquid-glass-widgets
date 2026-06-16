# Now Playing widget

Reads macOS system-wide MediaRemote state. Shows whatever you're playing — YouTube Music in any browser, Apple Music, Spotify, podcasts, all of it. Hides when nothing is playing.

## Setup

Requires `nowplaying-cli`, a tiny Swift binary (~50KB) that exposes the private MediaRemote framework. Install once:

```bash
mkdir -p ~/.local/bin && curl -fsSL -o ~/.local/bin/nowplaying-cli \
  https://github.com/kirtan-shah/nowplaying-cli/releases/download/v2.1.0/nowplaying-cli && \
  chmod +x ~/.local/bin/nowplaying-cli
```

Then Übersicht → Refresh All.

## Behavior

- Hides entirely when nothing is playing (no error state, no empty card)
- Polls every 5 seconds — cheap, fully local, no network
- Shows: album art (if available), title, artist · album
- Position: bottom-right of screen

## YouTube Music note

For YouTube Music in a browser tab, MediaRemote picks up whatever metadata the page sends via the MediaSession API. For Quran content the title may be the surah name or just the video title — depends on what the channel publishes.

## Tweaks

- Reposition: edit `bottom`/`right` in `index.jsx`.
- Change refresh: edit `refreshFrequency` (ms). Don't go below 1000.
- Max title width: edit `max-width` in `titleCss` / `subCss`.
