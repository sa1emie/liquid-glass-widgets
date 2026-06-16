// Auction watcher — BMW 3/4-series search from ~/Desktop/projects/car/auction.py.
// Runs the script at most once per 24h via fetch.sh cache. Hides when no new matches.
import { css, run } from "uebersicht";

export const command = "bash '$HOME/Library/Application Support/Übersicht/widgets/auctions.widget/fetch.sh'";
export const refreshFrequency = 60 * 60 * 1000; // hourly check; fetch.sh enforces 24h cache.

export const className = css`
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap");
  bottom: 24px;
  left: 24px;
  font-family: "Plus Jakarta Sans", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #fff;
  user-select: none;
  z-index: 100;
`;

const cardCss = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.10) 100%),
    rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(255, 255, 255, 0.10),
    0 14px 36px rgba(0, 0, 0, 0.4);
  max-width: 320px;
  min-width: 220px;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2), background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  &:hover {
    transform: translateY(-3px) scale(1.015);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.14) 100%),
      rgba(255,255,255,0.16);
    border-color: rgba(255,255,255,0.65);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.55),
      inset 0 -1px 0 rgba(255, 255, 255, 0.14),
      0 22px 56px rgba(0, 0, 0, 0.45);
  }
`;

const headRowCss = css`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const tagCss = css`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  opacity: 0.7;
`;

const countCss = css`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  opacity: 0.85;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(150, 220, 150, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
`;

const titleCss = css`
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.3px;
  line-height: 1.25;
  margin-top: 2px;
`;

const metaCss = css`
  display: flex;
  gap: 10px;
  font-size: 11px;
  font-weight: 600;
  opacity: 0.78;
  letter-spacing: -0.1px;
  flex-wrap: wrap;
`;

const dotCss = css`opacity: 0.4;`;

const priceCss = css`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.2px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const ctaCss = css`
  font-size: 9px;
  font-weight: 700;
  opacity: 0.55;
  letter-spacing: 0.6px;
  text-transform: uppercase;
`;

function fmtMoney(v) {
  if (v == null || v === "" || v === 0) return null;
  var n = Number(v);
  if (isNaN(n) || n === 0) return null;
  return "$" + Math.round(n).toLocaleString();
}

function fmtMiles(lot) {
  if (lot.odometer_unknown) return "??mi";
  if (!lot.odometer) return "—";
  return Math.round(lot.odometer).toLocaleString() + "mi";
}

function fmtDist(lot) {
  if (lot.distance_mi == null) return "≤250mi";
  return Math.round(lot.distance_mi) + "mi away";
}

function cleanModel(model) {
  // Strip leading year and "BMW" so it doesn't repeat with the year field.
  var m = String(model || "");
  m = m.replace(/^(19|20)\d{2}\s+/i, "");
  m = m.replace(/^bmw\s+/i, "");
  return m.trim();
}

export const render = ({ output }) => {
  if (!output) return null;

  var d;
  try { d = JSON.parse(output); } catch (e) { return null; }
  if (!d || !d.new_count || !d.matches || !d.matches.length) return null;

  var top = d.matches[0];
  var bid = fmtMoney(top.bid);
  var buyNow = fmtMoney(top.buy_now);
  var priceStr = buyNow ? (bid ? bid + " · BIN " + buyNow : "BIN " + buyNow) : (bid || "no bid yet");

  var onClick = function() {
    if (top.url) run(`open "${top.url.replace(/"/g, '%22')}"`);
  };

  return (
    <div className={cardCss} onClick={onClick} title="Open listing">
      <div className={headRowCss}>
        <div className={tagCss}>🚗 New auctions</div>
        <div className={countCss}>{d.new_count} new</div>
      </div>
      <div className={titleCss}>
        {top.year} {cleanModel(top.model)}
      </div>
      <div className={metaCss}>
        <span>{fmtMiles(top)}</span>
        <span className={dotCss}>·</span>
        <span>{(top.yard || "?").toUpperCase()}</span>
        <span className={dotCss}>·</span>
        <span>{fmtDist(top)}</span>
      </div>
      <div className={priceCss}>
        <span>{priceStr}</span>
        <span className={ctaCss}>open ↗</span>
      </div>
    </div>
  );
};
