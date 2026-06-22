#!/bin/bash
# Builds today's plan as JSON for the widget by reading directly from sentinel.db
# (prayers + commitments) and a local tasks file. Sentinel doesn't have a tasks
# concept yet; spontaneous todos live in ~/.config/sentinel-widget/tasks.json
# and the `todo` CLI manipulates that file.
set -u
DB="$HOME/Desktop/projects/sentinel/data/sentinel.db"
TASKS="$HOME/.config/sentinel-widget/tasks.json"
HABITS="$HOME/.config/sentinel-widget/habits.json"
TODAY=$(/bin/date '+%Y-%m-%d')

[[ -s "$TASKS" ]] || printf '[]' > "$TASKS"
[[ -s "$HABITS" ]] || printf '{"habits":[]}' > "$HABITS"

# Sentinel stores times in UTC; SQLite's `datetime(..., 'localtime')` converts
# to America/Chicago for the user (configured timezone). For date filtering we
# need the LOCAL date — `date('now', 'localtime')` returns today in CT.

if [[ ! -f "$DB" ]]; then
  printf '{"error":"db_missing","tasks":%s}\n' "$(/bin/cat "$TASKS")"
  exit 0
fi

PRAYERS=$(/usr/bin/sqlite3 -json "$DB" "
  SELECT name,
         strftime('%H:%M', at, 'localtime') AS local_time,
         strftime('%s', at) AS epoch,
         prayed_at IS NOT NULL AS prayed
  FROM prayer_times
  WHERE date_local = date('now', 'localtime')
  ORDER BY at
" 2>/dev/null || printf '[]')

COMMITS=$(/usr/bin/sqlite3 -json "$DB" "
  SELECT title, kind,
         strftime('%H:%M', dtstart, 'localtime') AS local_time,
         duration_minutes,
         location
  FROM commitments
  WHERE active = 1
    AND date(dtstart, 'localtime') = date('now', 'localtime')
  ORDER BY dtstart
" 2>/dev/null || printf '[]')

STUDY=$(/usr/bin/sqlite3 -json "$DB" "
  SELECT
    strftime('%H:%M', scheduled_at, 'localtime') AS local_time,
    duration_minutes,
    status
  FROM study_blocks
  WHERE date(scheduled_at, 'localtime') = date('now', 'localtime')
    AND status IN ('planned','in_progress')
  ORDER BY scheduled_at
" 2>/dev/null || printf '[]')

TASK_LIST=$(/bin/cat "$TASKS")

# Habits: compute done_today + days completed in the last 7 days.
HABITS_DATA=$(/usr/bin/jq --arg today "$TODAY" '
  .habits | map(
    ((.completed_dates // []) | sort | reverse) as $dates |
    {
      id, name, icon, note,
      done_today: ($dates | any(. == $today)),
      week_count: (
        ($today | strptime("%Y-%m-%d") | mktime) as $t0 |
        reduce range(0; 7) as $i (0;
          (($t0 - $i * 86400) | strftime("%Y-%m-%d")) as $d |
          if ($dates | any(. == $d)) then . + 1 else . end
        )
      )
    }
  )
' "$HABITS")

/usr/bin/jq -nc \
  --argjson prayers "${PRAYERS:-[]}" \
  --argjson commits "${COMMITS:-[]}" \
  --argjson study "${STUDY:-[]}" \
  --argjson tasks "${TASK_LIST:-[]}" \
  --argjson habits "${HABITS_DATA:-[]}" \
  --arg today "$(/bin/date '+%a %b %-d')" \
  '{today: $today, prayers: $prayers, commits: $commits, study: $study, tasks: $tasks, habits: $habits}'
