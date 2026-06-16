# Weather widget

Minimalist NWS (api.weather.gov) widget for Übersicht. Native macOS Liquid Glass aesthetic.

## Why NWS

- **Free forever, no API key, no signup.** US National Weather Service public API.
- **The source-of-truth for US weather.** AccuWeather, Apple Weather, Weather.com all consume NWS forecasts under the hood.
- **No rate limit published.** A 15-minute refresh = 96 calls/day, well within "reasonable use."

## Setup

1. **Enable Location Services for CoreLocationCLI:**
   - System Settings → Privacy & Security → Location Services
   - Toggle "Location Services" ON (top toggle)
   - Find `CoreLocationCLI` in the list → enable it
   - First widget load will trigger the system prompt if it hasn't appeared yet

2. **Reload the widget:** Übersicht menu bar icon → Refresh All

That's it. No config file required for the default setup.

## Optional: config.json

For unit overrides only:

```bash
mkdir -p ~/.config/weather-widget
cat > ~/.config/weather-widget/config.json <<'EOF'
{
  "units": "imperial"
}
EOF
```

(NWS itself is US-only; "metric" only affects display formatting if you're parsing custom data — leave as imperial unless you're tweaking the code.)

## Interactions

- **Click the card** → expands to show humidity, wind, hourly forecast (next 12h), and rain warning if precipitation probability is >= 30% in the next 6 hours.
- **Hover** → shows humidity + wind in tooltip.

## Refresh / caching

| Item | Cadence |
|---|---|
| Location | every 14 days |
| NWS grid point | every 90 days |
| Hourly forecast | every 15 min |

## Limits

- **US only.** NWS doesn't cover outside the US. If you need international, swap fetch.sh to use Open-Meteo or wttr.in (the widget UI doesn't care which JSON shape it gets, as long as the field names match).
- **Mullvad note:** If you're on Mullvad VPN, NWS works through most exit nodes; Open-Meteo was blocked through this exit during setup.

## Tweaks

- Reposition: edit `top` / `right` in `index.jsx` (`className` block at top).
- Change refresh: edit `refreshFrequency` in `index.jsx`.
- Change icons: edit `iconFor` mapping in `index.jsx`.
