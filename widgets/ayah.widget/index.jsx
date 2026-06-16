// Ayah of the Day — Juz 30, Arabic only, advances daily by day-of-year.
// Zero network: reads local juz30.json + surahs.json. Click opens Tarteel to the ayah.
import { css, run } from "uebersicht";

const WIDGET_DIR = "$HOME/Library/Application Support/Übersicht/widgets/ayah.widget";

// Refresh once an hour is fine — the ayah only changes at midnight.
export const refreshFrequency = 60 * 60 * 1000;

// Output both data files so render can build the day's ayah.
export const command = `cat "${WIDGET_DIR}/juz30.json"; printf '\\n--SEP--\\n'; cat "${WIDGET_DIR}/surahs.json"`;

export const className = css`
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,500;0,600;0,700;1,500&display=swap");
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Plus Jakarta Sans", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #fff;
  user-select: none;
  z-index: 100;
`;

// Liquid glass — quieter than the weather card but still frosted.
const cardCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 30px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.09) 100%),
    rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.38);
  backdrop-filter: blur(28px) saturate(1.5);
  -webkit-backdrop-filter: blur(28px) saturate(1.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08),
    0 10px 30px rgba(0, 0, 0, 0.35);
  max-width: 720px;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2), background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-2px) scale(1.012);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 100%),
      rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.52);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      inset 0 -1px 0 rgba(255, 255, 255, 0.12),
      0 16px 40px rgba(0, 0, 0, 0.4);
  }
`;

const ayahCss = css`
  font-family: "Geeza Pro", "SF Arabic", "Arial", system-ui, sans-serif;
  font-size: 26px;
  line-height: 1.7;
  direction: rtl;
  text-align: center;
  font-weight: 400;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  padding: 0 6px;
`;

const refCss = css`
  font-size: 10px;
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0.8px;
  opacity: 0.55;
  text-transform: uppercase;
`;

const errCss = css`
  padding: 12px 18px;
  border-radius: 16px;
  background: rgba(255, 80, 80, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  max-width: 320px;
  text-align: center;
`;

function dayOfYear() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  return Math.floor(diff / 86400000);
}

export const render = ({ output }) => {
  if (!output) return <div className={errCss}>Loading ayah…</div>;

  var parts = String(output).split("\n--SEP--\n");
  if (parts.length < 2) return <div className={errCss}>Bad widget data files.</div>;

  var ayahs, surahs;
  try {
    ayahs = JSON.parse(parts[0]);
    surahs = JSON.parse(parts[1]);
  } catch (e) {
    return <div className={errCss}>Couldn't parse Juz 30 data.</div>;
  }
  if (!ayahs.length) return <div className={errCss}>Ayah list is empty.</div>;

  var idx = dayOfYear() % ayahs.length;
  var ayah = ayahs[idx];

  var surahName = "";
  for (var i = 0; i < surahs.length; i++) {
    if (surahs[i].s === ayah.s) { surahName = surahs[i].ar; break; }
  }
  var label = (surahName || ("Surah " + ayah.s)) + " · " + ayah.s + ":" + ayah.a;

  var onClick = function() {
    run(`bash "${WIDGET_DIR}/open.sh" ${ayah.s} ${ayah.a}`);
  };

  return (
    <div className={cardCss} onClick={onClick} title="Open in Tarteel">
      <div className={ayahCss}>{ayah.t}</div>
      <div className={refCss}>{label}</div>
    </div>
  );
};
