// Now Playing — bubbbly-style Liquid Glass. Reads macOS MediaRemote via nowplaying-cli.
import { css } from "uebersicht";

export const command = "bash '$HOME/Library/Application Support/Übersicht/widgets/nowplaying.widget/fetch.sh'";
export const refreshFrequency = 5 * 1000;

export const className = css`
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
  bottom: 24px;
  right: 24px;
  font-family: "Plus Jakarta Sans", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #fff;
  user-select: none;
  z-index: 100;
`;

const cardCss = css`
  display: flex; align-items: center; gap: 12px;
  padding: 12px 18px 12px 12px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.10) 100%),
    rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(255, 255, 255, 0.10),
    0 12px 32px rgba(0, 0, 0, 0.35);
  max-width: 340px;
`;

const artBase = `
  width: 48px; height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
`;
const artCss = css`${artBase} background-size: cover; background-position: center; background-color: rgba(255,255,255,0.06);`;
const noArtCss = css`
  ${artBase}
  background-color: rgba(255, 255, 255, 0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 800; opacity: 0.75;
`;

const textCss = css`display: flex; flex-direction: column; min-width: 0; gap: 3px;`;
const titleCss = css`
  font-size: 14px; font-weight: 700; letter-spacing: -0.2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;
`;
const subCss = css`
  font-size: 11px; font-weight: 600; opacity: 0.7;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;
`;

const errCss = css`
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255, 80, 80, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(22px) saturate(1.2);
  -webkit-backdrop-filter: blur(22px) saturate(1.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
  font-size: 11px; font-weight: 600;
  max-width: 320px; line-height: 1.5;
  color: #fff;
`;

export const render = ({ output }) => {
  if (!output) return null;
  var d;
  try { d = JSON.parse(output); } catch (e) { return null; }
  if (d.error === "missing_binary") {
    return <div className={errCss}>Now Playing needs <b>nowplaying-cli</b>. See README.</div>;
  }
  if (d.hidden) return null;

  var hasArt = d.artPath && d.artPath.length > 0;
  var bust = Math.floor(Date.now() / 5000);
  var artStyle = hasArt ? { backgroundImage: "url(file://" + d.artPath + "?t=" + bust + ")" } : null;

  return (
    <div className={cardCss}>
      {hasArt
        ? <div className={artCss} style={artStyle} />
        : <div className={noArtCss}>♪</div>}
      <div className={textCss}>
        <div className={titleCss}>{d.title || "Untitled"}</div>
        <div className={subCss}>{d.artist}{d.album && d.album !== d.artist ? " · " + d.album : ""}</div>
      </div>
    </div>
  );
};
