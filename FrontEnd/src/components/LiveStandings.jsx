import "./LiveStandings.css";

const initialsOf = (name) =>
  name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const fmt = (n) => n.toLocaleString("en-US");

const TrophyIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
  </svg>
);

/* entries: [{ name, pts }] urut dari poin tertinggi
   me (opsional): { rank, name, initials, avatar?, pts, sub } */
export default function LiveStandings({ entries = [], me = null }) {
  // urutan tampil podium: peringkat 2, 1, 3
  const slots = [
    { rank: 2, e: entries[1] },
    { rank: 1, e: entries[0] },
    { rank: 3, e: entries[2] },
  ];
  const rows = entries.slice(3, 6);

  return (
    <section className="ls" aria-label="Live Standings">
      <div className="ls-head">
        <h2 className="ls-title">
          <TrophyIcon /> Live Standings
        </h2>
        <span className="ls-live">
          <i /> Live
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="ls-empty">Belum ada peserta. Jadilah yang pertama menyelesaikan soal.</p>
      ) : (
        <>
          <div className="ls-podium">
            {slots.map(({ rank, e }) => (
              <div className={"ls-slot rank-" + rank} key={rank}>
                {rank === 1 && (
                  <span className="ls-crown">
                    <TrophyIcon size={14} />
                  </span>
                )}
                {e ? (
                  <>
                    <span className="ls-avatar">
                      {initialsOf(e.name)}
                      <b className="ls-badge">{rank}</b>
                    </span>
                    <strong className="ls-name">{e.name}</strong>
                    <span className="ls-pts">{fmt(e.pts)}</span>
                  </>
                ) : (
                  <span className="ls-avatar is-empty">—</span>
                )}
                <span className="ls-block" aria-hidden="true" />
              </div>
            ))}
          </div>

          {rows.length > 0 && (
            <ol className="ls-rows">
              {rows.map((e, i) => (
                <li key={e.name}>
                  <span className="ls-rank">#{i + 4}</span>
                  <span className="ls-row-name">{e.name}</span>
                  <span className="ls-row-pts">{fmt(e.pts)} pts</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {me && (
        <div className="ls-me">
          <span className="ls-me-rank">#{me.rank}</span>
          <span className="ls-me-avatar">
            {me.avatar ? <img src={me.avatar} alt="" /> : me.initials}
          </span>
          <span className="ls-me-name">
            <b>{me.name}</b>
            <small>{me.sub}</small>
          </span>
          <span className="ls-me-pts">{fmt(me.pts)} pts</span>
        </div>
      )}
    </section>
  );
}