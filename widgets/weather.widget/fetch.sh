#!/bin/bash
# NWS (api.weather.gov) — free, no key, US gov data. Most accurate for US locations.
# Single hourly call covers current + 12h forecast. Refresh every 15 min = 96 calls/day, no published cap.
set -u
CONFIG_DIR="$HOME/.config/weather-widget"
LOC="$CONFIG_DIR/location.cache"
POINTS="$CONFIG_DIR/points.cache"
UA="weather-widget/1.0 (personal)"
mkdir -p "$CONFIG_DIR"

err() { printf '{"error":"%s","detail":%s}\n' "$1" "${2:-null}"; exit 0; }

# Always re-detect location (CoreLocationCLI is fast). Compare to cached value
# so we know whether to invalidate the NWS grid cache below.
PREV_LATLON=""
[[ -s "$LOC" ]] && PREV_LATLON=$(/bin/cat "$LOC")

RAW=$(/opt/homebrew/bin/CoreLocationCLI -once 2>&1 | /usr/bin/head -n1)
CLEAN=$(printf '%s' "$RAW" | /usr/bin/awk 'NF>=2 && $1+0 != 0 {printf "%.4f,%.4f", $1, $2}')
if [[ -z "$CLEAN" ]]; then
  # If we have a cached location, keep using it rather than erroring.
  [[ -n "$PREV_LATLON" ]] || err "no_location" "\"$RAW. Enable Location Services for CoreLocationCLI in System Settings.\""
  CLEAN="$PREV_LATLON"
fi
printf '%s' "$CLEAN" > "$LOC"
LATLON="$CLEAN"

# Invalidate NWS grid cache if location moved more than ~1 mile (0.01° lat or lon).
LOCATION_CHANGED=0
if [[ -n "$PREV_LATLON" && "$PREV_LATLON" != "$LATLON" ]]; then
  MOVED=$(/usr/bin/awk -v a="$PREV_LATLON" -v b="$LATLON" 'BEGIN{
    split(a,p,","); split(b,c,",");
    dlat = (p[1]-c[1]); if(dlat<0)dlat=-dlat;
    dlon = (p[2]-c[2]); if(dlon<0)dlon=-dlon;
    print (dlat>0.01 || dlon>0.01) ? 1 : 0
  }')
  [[ "$MOVED" == "1" ]] && LOCATION_CHANGED=1
fi

if [[ ! -s "$POINTS" ]] || [[ "$LOCATION_CHANGED" == "1" ]] || /usr/bin/find "$POINTS" -mtime +30 -print -quit 2>/dev/null | /usr/bin/grep -q .; then
  PR=$(/usr/bin/curl -sS --max-time 10 -H "User-Agent: $UA" "https://api.weather.gov/points/${LATLON}")
  HOURLY_URL=$(printf '%s' "$PR" | /usr/bin/jq -r '.properties.forecastHourly // empty')
  [[ -n "$HOURLY_URL" ]] || err "no_grid" "$(printf '%s' "$PR" | /usr/bin/jq -c '. // {}' | /usr/bin/head -c 200)"

  # Reverse-geocode for a colloquial city name (Nominatim picks "Arlington" over NWS's
  # "Dalworthington Gardens" which is the legal place name of that lat/lon pocket).
  NLAT="${LATLON%,*}"; NLON="${LATLON#*,}"
  NOM=$(/usr/bin/curl -sS --max-time 8 -H "User-Agent: $UA" "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${NLAT}&lon=${NLON}&zoom=10")
  PRETTY_CITY=$(printf '%s' "$NOM" | /usr/bin/jq -r '.address.city // .address.town // .address.village // .address.suburb // empty' 2>/dev/null)
  PRETTY_STATE=$(printf '%s' "$NOM" | /usr/bin/jq -r '.address."ISO3166-2-lvl4" // empty | sub("^US-"; "")' 2>/dev/null)

  printf '%s' "$PR" | /usr/bin/jq --arg pcity "$PRETTY_CITY" --arg pstate "$PRETTY_STATE" -c '{
    hourlyUrl: .properties.forecastHourly,
    forecastUrl: .properties.forecast,
    city: (if $pcity != "" then $pcity else .properties.relativeLocation.properties.city end),
    state: (if $pstate != "" then $pstate else .properties.relativeLocation.properties.state end)
  }' > "$POINTS"
fi
HOURLY_URL=$(/usr/bin/jq -r '.hourlyUrl' "$POINTS")
CITY=$(/usr/bin/jq -r '.city' "$POINTS")
STATE=$(/usr/bin/jq -r '.state' "$POINTS")

RESP=$(/usr/bin/curl -sS --max-time 10 -H "User-Agent: $UA" "$HOURLY_URL")
[[ -n "$RESP" ]] || err "no_response" '"NWS hourly unreachable"'

printf '%s' "$RESP" | /usr/bin/jq --arg city "$CITY" --arg state "$STATE" -c '
  .properties.periods[0:13] as $p |
  if ($p | length) == 0 then {error:"no_periods"} else
  {
    temp: $p[0].temperature,
    unit: ("°" + ($p[0].temperatureUnit // "F")),
    condition: $p[0].shortForecast,
    isDay: $p[0].isDaytime,
    humidity: ($p[0].relativeHumidity.value // null),
    wind: $p[0].windSpeed,
    windDir: $p[0].windDirection,
    precipProb: ($p[0].probabilityOfPrecipitation.value // 0),
    dewpoint: ($p[0].dewpoint.value // null),
    city: $city,
    state: $state,
    hourly: [$p[] | {
      time: .startTime,
      temp: .temperature,
      cond: .shortForecast,
      isDay: .isDaytime,
      precipProb: (.probabilityOfPrecipitation.value // 0)
    }],
    rainSoon: ([$p[0:6][] | (.probabilityOfPrecipitation.value // 0)] | max)
  }
  end' 2>/dev/null || err "parse_failed" "$(printf '%s' "$RESP" | /usr/bin/head -c 200 | /usr/bin/jq -Rc '.')"
