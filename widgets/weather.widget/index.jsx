// Weather widget — bubbbly-style Liquid Glass. Plus Jakarta Sans.
// Simplified: focus on current weather. Hourly available on hover.
import { css } from "uebersicht";

export const command = "bash '$HOME/Library/Application Support/Übersicht/widgets/weather.widget/fetch.sh'";
export const refreshFrequency = 15 * 60 * 1000;

function iconFor(cond, isDay) {
  var c = String(cond || "").toLowerCase();
  if (c.indexOf("thunder") >= 0) return "⛈";
  if (c.indexOf("snow") >= 0 && c.indexOf("rain") >= 0) return "🌨";
  if (c.indexOf("snow") >= 0 || c.indexOf("sleet") >= 0 || c.indexOf("flurr") >= 0) return "❄️";
  if (c.indexOf("freezing") >= 0) return "🌨";
  if (c.indexOf("shower") >= 0 || c.indexOf("rain") >= 0 || c.indexOf("drizzle") >= 0) return "🌧";
  if (c.indexOf("fog") >= 0 || c.indexOf("haze") >= 0 || c.indexOf("mist") >= 0) return "🌫";
  if (c.indexOf("wind") >= 0) return "💨";
  if (c.indexOf("partly sunny") >= 0 || c.indexOf("partly cloudy") >= 0) return isDay ? "⛅" : "☁️";
  if (c.indexOf("mostly cloudy") >= 0 || c.indexOf("cloudy") >= 0 || c.indexOf("overcast") >= 0) return "☁️";
  if (c.indexOf("mostly sunny") >= 0 || c.indexOf("mostly clear") >= 0) return isDay ? "🌤" : "🌙";
  if (c.indexOf("sunny") >= 0 || c.indexOf("clear") >= 0) return isDay ? "☀️" : "🌙";
  return "🌡";
}

function fmtHour(iso) {
  var d = new Date(iso);
  var h = d.getHours();
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? h + "a" : (h - 12) + "p";
}

export const className = css`
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
  top: 24px;
  right: 24px;
  font-family: "Plus Jakarta Sans", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #fff;
  user-select: none;
  z-index: 100;
`;

// Liquid-glass card. Heavier frost + gradient overlay for a true glass look.
// Reveals an hourly strip on hover. Needs onClick on the element below for Übersicht
// to enable pointer events (without it, :hover doesn't fire).
const cardCss = css`
  display: inline-flex;
  flex-direction: column;
  padding: 20px 24px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.10) 100%),
    rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(255, 255, 255, 0.10),
    0 14px 40px rgba(0, 0, 0, 0.4);
  min-width: 220px;
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2), background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: pointer;

  /* Forecast section starts hidden + dimmed. */
  & .forecast {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.0), opacity 0.3s ease 0.05s, margin 0.3s ease;
    margin-top: 0;
    padding-top: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.0);
  }

  &:hover {
    transform: translateY(-3px) scale(1.015);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.14) 100%),
      rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.65);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.55),
      inset 0 -1px 0 rgba(255, 255, 255, 0.14),
      0 22px 56px rgba(0, 0, 0, 0.45);
  }

  &:hover .forecast {
    max-height: 160px;
    opacity: 1;
    margin-top: 16px;
    padding-top: 14px;
    border-top-color: rgba(255, 255, 255, 0.16);
  }
`;

const headRowCss = css`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
`;

const locCss = css`
  font-size: 10px;
  font-weight: 800;
  opacity: 0.7;
  letter-spacing: 1.4px;
  text-transform: uppercase;
`;

const hourLabelCss = css`
  font-size: 10px;
  font-weight: 600;
  opacity: 0.55;
  letter-spacing: 0.3px;
`;

const mainCss = css`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const iconCss = css`
  font-size: 56px;
  line-height: 1;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
`;

const tempCss = css`
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -2px;
  line-height: 1;
`;

const tempUnitCss = css`
  font-size: 20px;
  font-weight: 700;
  opacity: 0.55;
  margin-left: 4px;
  letter-spacing: -0.4px;
`;

const condCss = css`
  font-size: 13px;
  font-weight: 600;
  opacity: 0.88;
  margin-top: 8px;
  letter-spacing: -0.1px;
  max-width: 200px;
`;

const statsRowCss = css`
  display: flex;
  gap: 14px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
`;

const statCss = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  & .l { font-size: 9px; font-weight: 700; opacity: 0.55; text-transform: uppercase; letter-spacing: 0.8px; }
  & .v { font-size: 13px; font-weight: 700; letter-spacing: -0.2px; }
`;

const rainBannerCss = css`
  margin-top: 12px;
  padding: 9px 12px;
  border-radius: 14px;
  background: rgba(120, 180, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const hourlyRowCss = css`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`;

const hourCellCss = css`
  text-align: center;
  & .h { font-size: 9px; font-weight: 700; opacity: 0.55; letter-spacing: 0.4px; margin-bottom: 4px; }
  & .e { font-size: 18px; line-height: 1; margin-bottom: 3px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35)); }
  & .t { font-size: 12px; font-weight: 700; letter-spacing: -0.2px; }
  & .p { font-size: 8px; font-weight: 700; margin-top: 2px; color: #9cc8ff; height: 10px; }
`;

const errCss = css`
  padding: 16px 20px;
  border-radius: 22px;
  background: rgba(255, 80, 80, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(22px) saturate(1.2);
  -webkit-backdrop-filter: blur(22px) saturate(1.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
  font-size: 12px;
  font-weight: 600;
  max-width: 280px;
  line-height: 1.45;
  color: #fff;
`;

const errLabel = {
  no_location: "Enable Location Services for CoreLocationCLI",
  no_grid: "NWS grid lookup failed (outside US?)",
  no_response: "NWS unreachable — VPN issue?",
  parse_failed: "Couldn't parse NWS response",
};

export const render = ({ output }) => {
  if (!output) return <div className={errCss}>Loading weather…</div>;

  var d;
  try { d = JSON.parse(output); }
  catch (e) { return <div className={errCss}>Bad output: {String(output).slice(0, 140)}</div>; }

  if (d.error) {
    return (
      <div className={errCss}>
        {errLabel[d.error] || d.error}
        {d.detail ? <div style={{opacity:0.6, marginTop:6, fontSize:10, fontWeight:500}}>{String(d.detail).slice(0,160)}</div> : null}
      </div>
    );
  }

  var icon = iconFor(d.condition, d.isDay);
  var willRain = (d.rainSoon || 0) >= 30;
  var nowHour = new Date().getHours();
  var ampm = nowHour === 0 ? "12 AM" : nowHour < 12 ? nowHour + " AM" : nowHour === 12 ? "12 PM" : (nowHour - 12) + " PM";

  // No-op onClick — Übersicht only enables pointer events (hover, etc.) on widgets that declare onClick.
  var noop = function() {};

  return (
    <div className={cardCss} onClick={noop}>
      <div className={headRowCss}>
        <div className={locCss}>{d.city}{d.state ? ", " + d.state : ""}</div>
        <div className={hourLabelCss}>{ampm}</div>
      </div>

      <div className={mainCss}>
        <div className={iconCss}>{icon}</div>
        <div>
          <div>
            <span className={tempCss}>{Math.round(d.temp)}</span>
            <span className={tempUnitCss}>{d.unit}</span>
          </div>
          <div className={condCss}>{d.condition}</div>
        </div>
      </div>

      <div className={statsRowCss}>
        <div className={statCss}><div className="l">Humidity</div><div className="v">{d.humidity != null ? d.humidity + "%" : "—"}</div></div>
        <div className={statCss}><div className="l">Wind</div><div className="v">{d.wind || "—"}</div></div>
        <div className={statCss}><div className="l">Rain</div><div className="v">{(d.precipProb || 0) + "%"}</div></div>
      </div>

      {willRain ? <div className={rainBannerCss}>🌧 Rain likely in 6h (max {d.rainSoon}%)</div> : null}

      <div className="forecast">
        <div className={hourlyRowCss}>
          {(d.hourly || []).slice(1, 7).map(function(h, i) {
            return (
              <div key={i} className={hourCellCss}>
                <div className="h">{fmtHour(h.time)}</div>
                <div className="e">{iconFor(h.cond, h.isDay)}</div>
                <div className="t">{Math.round(h.temp)}°</div>
                <div className="p">{h.precipProb > 0 ? h.precipProb + "%" : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
