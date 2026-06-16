# Liquid Glass Widgets for macOS

A set of custom desktop widgets for [Übersicht](https://tracesof.net/uebersicht/), styled after Apple's Liquid Glass design language introduced in iOS 26 / macOS Tahoe. Plus Jakarta Sans, visible glass rim, top-to-bottom highlight gradient, 28 px backdrop blur with 1.6× saturation — calibrated to feel like a sheet of frosted glass catching light against the wallpaper underneath.

Five widgets, each readable as a standalone Übersicht project under `widgets/`:

| Widget | Position | What it shows | Data source |
|---|---|---|---|
| `weather.widget`     | top-right     | Temp + condition for your city, expands on hover to a 6-hour forecast | National Weather Service (`api.weather.gov`) + OpenStreetMap reverse-geocode (city name) |
| `nowplaying.widget`  | bottom-right  | Track + artist + album art for whatever is playing system-wide (YouTube Music in any browser, Apple Music, Spotify, podcasts) | [`nowplaying-cli`](https://github.com/kirtan-shah/nowplaying-cli) → macOS MediaRemote |
| `ayah.widget`        | top-center    | Daily ayah from Juz 30, advances by day-of-year, click → opens Tarteel | Local JSON (`juz30.json`, `surahs.json`) — zero network |
| `auctions.widget`    | bottom-left   | Count + latest match from a BMW auction watcher, daily cache | Local Python script (`auction.py`) — see [bmw-auction-watcher](../bmw-auction-watcher) |
| `today.widget`       | left, center  | Today's prayers (clickable to mark prayed), habits (e.g. Gym / Quran with weekly count), tasks, commitments | SQLite (from [sentinel](../sentinel)) + JSON files |

## Design language

Common glass formula used across all five widgets:

```css
background:
  linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.10) 100%),
  rgba(255, 255, 255, 0.12);
border: 1px solid rgba(255, 255, 255, 0.45);
backdrop-filter: blur(28px) saturate(1.6);
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.45),
  inset 0 -1px 0 rgba(255, 255, 255, 0.10),
  0 14px 36px rgba(0, 0, 0, 0.4);
```

The visible white rim (1 px @ 45%) plus the bright top inset highlight (45%) is what creates the "curved sheet of glass" feel — borrowed from the [bubbbly.com](https://www.bubbbly.com/) GitHub badge tool. Hover scales 1.012× + lifts 3 px with a cubic-bezier overshoot.

Font: Plus Jakarta Sans (Google Fonts) at weights 500–800, loaded via CSS `@import` inside each widget.

## Install

1. **Übersicht** from `brew install --cask ubersicht`.
2. Drop the contents of `widgets/` into `~/Library/Application Support/Übersicht/widgets/`.
3. Per-widget setup is documented in each widget's `README.md` where it has external dependencies (e.g. `nowplaying-cli` for the now-playing widget, `CoreLocationCLI` for weather).
4. Click the Ü in your menu bar → **Refresh All**.

## Engineering gotchas worth knowing

The README in each widget directory notes the lessons that took the longest to land. Highlights:

- **`render = ({ output }) =>` — do not provide a custom `updateState`** unless you also re-implement Übersicht's default output-merging. Otherwise `state.output` stays `undefined` forever and the widget renders blank.
- **`process.env.HOME` is unreliable in the renderer context** — hard-code the widget path string in `command`, since the path itself contains the `Ü` umlaut and quoting matters.
- **Pointer events only fire on widgets that declare `onClick`** — without one, hover styles never trigger.
- **macOS Tahoe (26) widgets are already Liquid Glass natively** — the native widget gallery (right-click desktop → Edit Widgets) gets the real `NSGlassEffectView`. These third-party widgets are a CSS approximation; they look close but the underlying material is private API only accessible from native AppKit.

## License

MIT (or unlicense — pick whatever fits).

## Reference images

`IMG_2737.PNG` and `IMG_2738.PNG` are the iPhone wallpapers that anchored the color palette — included for design context.
