// Today widget — Sentinel's plan for the day. Prayers + commitments + open tasks.
// Click a prayer to mark prayed. Click × on a task to complete it.
// Capture new tasks from terminal: `todo "buy milk"` (see ~/.local/bin/todo).
import { css, run, React } from "uebersicht";

const DIR = "$HOME/Library/Application Support/Übersicht/widgets/today.widget";

export const command = `bash "${DIR}/fetch.sh"`;
export const refreshFrequency = 30 * 1000; // poll every 30s — cheap (just sqlite + a tiny file).

export const className = css`
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap");
  top: 50%;
  left: 24px;
  transform: translateY(-50%);
  font-family: "Plus Jakarta Sans", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #fff;
  user-select: none;
  z-index: 100;
`;

// Background drawn by the shared glass.widget renderer (registered below).
const cardCss = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 24px;
  width: 280px;
`;

const dateRowCss = css`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const dateCss = css`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  opacity: 0.85;
`;

const headingCss = css`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  opacity: 0.55;
  margin-bottom: 8px;
`;

const sectionCss = css`
  display: flex;
  flex-direction: column;
`;

const prayerRowCss = css`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
`;

const prayerChipCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 7px 4px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.16);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.32);
    transform: translateY(-1px);
  }
  & .n { font-size: 9px; font-weight: 800; letter-spacing: 0.5px; opacity: 0.7; text-transform: uppercase; }
  & .t { font-size: 11px; font-weight: 700; letter-spacing: -0.3px; }
`;

const prayedCss = css`
  background: rgba(120, 220, 150, 0.18);
  border-color: rgba(120, 220, 150, 0.4);
  & .n { opacity: 0.95; }
`;

const nextLineCss = css`
  font-size: 10px;
  font-weight: 600;
  opacity: 0.6;
  margin-top: 8px;
  letter-spacing: 0.1px;
`;

const itemCss = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9px;
  & .meta { font-size: 10px; font-weight: 700; opacity: 0.55; flex-shrink: 0; min-width: 38px; }
  & .title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const taskItemCss = css`
  ${itemCss}
  & .x {
    width: 18px; height: 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease;
    opacity: 0.7;
  }
  & .x:hover { background: rgba(120, 220, 150, 0.30); border-color: rgba(120, 220, 150, 0.55); opacity: 1; transform: scale(1.1); }
`;

const habitItemCss = css`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: rgba(255, 255, 255, 0.05); }
  & .icon { font-size: 14px; }
  & .title { flex: 1; }
  & .streak { font-size: 10px; font-weight: 700; opacity: 0.5; letter-spacing: -0.2px; }
`;

const habitBoxCss = css`
  width: 16px; height: 16px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.30);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800;
  transition: background 0.15s ease, border-color 0.15s ease;
`;

const habitBoxDoneCss = css`
  background: rgba(120, 220, 150, 0.30);
  border-color: rgba(120, 220, 150, 0.6);
  color: #fff;
`;

const emptyCss = css`
  font-size: 11px;
  font-weight: 500;
  opacity: 0.45;
  font-style: italic;
  padding: 4px 8px;
`;

const captureHintCss = css`
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 9px;
  opacity: 0.35;
  text-align: center;
  padding-top: 4px;
  border-top: 1px dashed rgba(255, 255, 255, 0.10);
`;

const errCss = css`
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(255, 80, 80, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.32);
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  max-width: 280px;
`;

const PRAYER_SHORT = { fajr: "F", dhuhr: "D", asr: "A", maghrib: "M", isha: "I" };
const PRAYER_FULL = { fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };
const KIND_ICON = { class: "🎓", work: "💼", emt: "🚑", personal: "•", other: "•", prayer: "🕌" };

function fmtCountdown(secs) {
  if (secs < 60) return "now";
  var mins = Math.round(secs / 60);
  if (mins < 60) return "in " + mins + "m";
  var hrs = Math.floor(mins / 60);
  var rem = mins % 60;
  return rem > 0 ? "in " + hrs + "h " + rem + "m" : "in " + hrs + "h";
}

function fmtTime12(hhmm) {
  if (!hhmm) return "";
  var parts = hhmm.split(":");
  var h = parseInt(parts[0], 10);
  var m = parts[1];
  if (h === 0) return "12:" + m + "a";
  if (h === 12) return "12:" + m + "p";
  return h < 12 ? h + ":" + m + "a" : (h - 12) + ":" + m + "p";
}

function Today({ output }) {
  const cardRef = React.useRef(null);
  React.useEffect(() => {
    const item = { getEl: () => cardRef.current, radius: 24 };
    window.__glassRects = window.__glassRects || [];
    window.__glassRects.push(item);
    return () => { const a = window.__glassRects; const i = a.indexOf(item); if (i >= 0) a.splice(i, 1); };
  }, []);

  if (!output) return <div className={errCss}>Loading…</div>;

  var d;
  try { d = JSON.parse(output); } catch (e) { return <div className={errCss}>Bad widget data.</div>; }
  if (d.error === "db_missing") {
    return <div className={errCss}>Sentinel DB not found. Is the project at ~/Desktop/projects/sentinel?</div>;
  }

  var now = Math.floor(Date.now() / 1000);
  var prayers = d.prayers || [];
  var nextPrayer = null;
  for (var i = 0; i < prayers.length; i++) {
    if (!prayers[i].prayed && parseInt(prayers[i].epoch, 10) > now) {
      nextPrayer = prayers[i];
      break;
    }
  }

  var onPrayer = function(name) { return function() { run(`bash '${DIR}/click.sh' prayer ${name}`); }; };
  var onTaskDone = function(id) { return function() { run(`bash '${DIR}/click.sh' task ${id}`); }; };

  return (
    <div className={cardCss} ref={cardRef}>
      <div className={dateRowCss}>
        <div className={dateCss}>Today · {d.today}</div>
      </div>

      <div className={sectionCss}>
        <div className={headingCss}>Prayers</div>
        <div className={prayerRowCss}>
          {prayers.map(function(p) {
            var done = !!p.prayed;
            return (
              <div
                key={p.name}
                className={done ? `${prayerChipCss} ${prayedCss}` : prayerChipCss}
                onClick={onPrayer(p.name)}
                title={(done ? "Prayed " : "Not prayed · ") + PRAYER_FULL[p.name] + " at " + fmtTime12(p.local_time)}
              >
                <div className="n">{PRAYER_SHORT[p.name] || p.name[0].toUpperCase()}</div>
                <div className="t">{done ? "✓" : fmtTime12(p.local_time).replace(/:00/, "")}</div>
              </div>
            );
          })}
        </div>
        {nextPrayer ? (
          <div className={nextLineCss}>
            Next: {PRAYER_FULL[nextPrayer.name]} · {fmtTime12(nextPrayer.local_time)} · {fmtCountdown(parseInt(nextPrayer.epoch, 10) - now)}
          </div>
        ) : prayers.length > 0 ? (
          <div className={nextLineCss}>All prayed. Alhamdulillah.</div>
        ) : null}
      </div>

      <div className={sectionCss}>
        <div className={headingCss}>Commitments</div>
        {d.commits && d.commits.length ? (
          d.commits.map(function(c, i) {
            return (
              <div key={i} className={itemCss}>
                <span className="meta">{fmtTime12(c.local_time)}</span>
                <span>{KIND_ICON[c.kind] || "•"}</span>
                <span className="title">{c.title}</span>
              </div>
            );
          })
        ) : (
          <div className={emptyCss}>nothing scheduled — add via `sentinel commit add`</div>
        )}
      </div>

      {d.study && d.study.length ? (
        <div className={sectionCss}>
          <div className={headingCss}>Study Blocks</div>
          {d.study.map(function(s, i) {
            return (
              <div key={i} className={itemCss}>
                <span className="meta">{fmtTime12(s.local_time)}</span>
                <span className="title">{s.duration_minutes}m block</span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className={sectionCss}>
        <div className={headingCss}>Habits</div>
        {d.habits && d.habits.length ? d.habits.map(function(h) {
          var onToggle = function() { run(`bash '${DIR}/click.sh' habit ${h.id}`); };
          return (
            <div key={h.id} className={habitItemCss} onClick={onToggle} title={(h.done_today ? "Done today · " : "Tap to mark done · ") + h.week_count + "/7 this week"}>
              <span className={h.done_today ? `${habitBoxCss} ${habitBoxDoneCss}` : habitBoxCss}>{h.done_today ? "✓" : ""}</span>
              <span className="icon">{h.icon}</span>
              <span className="title">{h.name}</span>
              <span className="streak">{h.week_count}/7</span>
            </div>
          );
        }) : null}
      </div>

      <div className={sectionCss}>
        <div className={headingCss}>Tasks</div>
        {d.tasks && d.tasks.length ? (
          d.tasks.map(function(t) {
            return (
              <div key={t.id} className={taskItemCss}>
                <span className="title">{t.title}</span>
                <span className="x" onClick={onTaskDone(t.id)} title="Done">✓</span>
              </div>
            );
          })
        ) : (
          <div className={emptyCss}>no open tasks</div>
        )}
        <div className={captureHintCss}>todo "your task"</div>
      </div>
    </div>
  );
}

export const render = ({ output }) => <Today output={output} />;
