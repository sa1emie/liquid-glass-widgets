#!/bin/bash
# Handle widget clicks. Two subcommands:
#   click.sh prayer <name>    Mark today's prayer as prayed (writes prayed_at).
#   click.sh task <id>        Mark a task done (filters tasks.json).
set -u
DB="$HOME/Desktop/projects/sentinel/data/sentinel.db"
TASKS="$HOME/.config/sentinel-widget/tasks.json"
HABITS="$HOME/.config/sentinel-widget/habits.json"
TODAY=$(/bin/date '+%Y-%m-%d')

case "${1:-}" in
  prayer)
    NAME="${2:-}"
    [[ -z "$NAME" ]] && exit 1
    /usr/bin/sqlite3 "$DB" "UPDATE prayer_times
      SET prayed_at = datetime('now')
      WHERE date_local = date('now','localtime')
        AND name = '$NAME'
        AND prayed_at IS NULL"
    ;;
  task)
    ID="${2:-}"
    [[ -z "$ID" ]] && exit 1
    TMP=$(/usr/bin/mktemp)
    /usr/bin/jq "map(select(.id != \"$ID\"))" "$TASKS" > "$TMP" && /bin/mv "$TMP" "$TASKS"
    ;;
  habit)
    ID="${2:-}"
    [[ -z "$ID" ]] && exit 1
    TMP=$(/usr/bin/mktemp)
    /usr/bin/jq --arg id "$ID" --arg today "$TODAY" '
      .habits |= map(
        if .id == $id then
          if (.completed_dates // []) | index($today) then
            .completed_dates |= map(select(. != $today))
          else
            .completed_dates = ((.completed_dates // []) + [$today])
          end
        else . end
      )
    ' "$HABITS" > "$TMP" && /bin/mv "$TMP" "$HABITS"
    ;;
esac
