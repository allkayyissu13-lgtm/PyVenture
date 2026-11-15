import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "./dashboardpage.css";

/* ---------- Data contoh (ganti dengan data dari API kamu) ---------- */
const USER = { name: "Nama Pengguna", handle: "@username", level: 7, xp: 850, xpMax: 1100 };

const STATS = [
  { label: "Total Poin", value: "850", note: "", icon: "bolt" },
  { label: "Streak", value: "14 Hari", note: "Aktif berturut", icon: "flame", hot: true },
  { label: "Akurasi", value: "94%", note: "Total Quest", icon: "target" },
  { label: "Quest", value: "5", note: "/ 6 Modul", icon: "check" },
];

const BADGES = [
  { level: 1, name: "Novice", xp: "+50", tone: "blue", icon: "code", done: true },
  { level: 2, name: "Apprentice", xp: "+120", tone: "copper", icon: "star", done: true, hot: true },
  { level: 3, name: "Coder", xp: "+200", tone: "steel", icon: "shield", done: true },
  { level: 4, name: "Expert", xp: "+250", tone: "blue", icon: "bolt", done: true },
  { level: 5, name: "Master", xp: "+300", tone: "copper", icon: "star", done: true, hot: true },
  { level: 6, name: "Grandmaster", xp: "+500", tone: "locked", icon: "lock", done: false, progress: 7, total: 30 },
];

/* Podium berurutan: peringkat 2, 1, 3 (urutan tampil) */
const LEADERBOARD = {
  podium: [
    { rank: 2, name: "Fauzi", xp: "4,120" },
    { rank: 1, name: "Sihotang", xp: "4,890" },
    { rank: 3, name: "Azahra", xp: "3,990" },
  ],
  ranking: [
    { rank: 4, name: "Lionel Ashley", xp: "3,710" },
    { rank: 5, name: "Dzakwan Hibrizi", xp: "3,640" },
    { rank: 6, name: "Barra Allapydya", xp: "3,510" },
    { rank: 7, name: "Rushwa Bava", xp: "3,450", me: true, note: "Naik +1 Rank" },
    { rank: 8, name: "Indah Winatha", xp: "3,300" },
  ],
};

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------- Ikon ---------- */
const PATHS = {
  flag: <><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  flame: <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /></>,
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14" />,
  star: <path d="M12 2l2.6 6.4L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.4-.6z" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  play: <path d="M7 4l13 8-13 8z" />,
};

const Icon = ({ name, size = 14, solid = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={solid ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {PATHS[name]}
  </svg>
);

/* ---------- Halaman ---------- */
export default function DashboardPage() {
  const pct = Math.round((USER.xp / USER.xpMax) * 100);
  const collected = BADGES.filter((b) => b.done).length;

  return (
    <div className="dash-page">
      <Navbar active="home" />

      <div className="dash-shell">
        {/* ---------- Banner quest ---------- */}
        <section className="dash-quest" aria-label="Quest aktif">
          <span className="dash-quest-icon">
            <Icon name="flag" size={15} />
          </span>
          <div className="dash-quest-text">
            <p className="dash-quest-top">
              <span className="dash-quest-tag">Expedition Quest</span>
              <span className="dash-quest-mod">Modul 4 • Judul Modul</span>
            </p>
            <strong>Lanjutkan Quest:</strong>
          </div>
          <Link to="/quest" className="dash-btn-peach">
            Mulai Eksekusi <Icon name="play" size={9} solid />
          </Link>
        </section>

        <div className="dash-grid">
          {/* ---------- Kolom kiri ---------- */}
          <div className="dash-col">
            <section className="dash-card" aria-label="Profil">
              <div className="dash-profile-head">
                <h2 className="dash-profile-name">
                  {USER.name} <small>({USER.handle})</small>
                </h2>
                <span className="dash-profile-xp">
                  {pct}% • {USER.xp} / {USER.xpMax.toLocaleString("en-US")}
                </span>
              </div>
              <p className="dash-level">Level {USER.level}</p>
              <div
                className="dash-progress"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Progres level"
              >
                <span style={{ width: pct + "%" }} />
              </div>

              <div className="dash-stats">
                {STATS.map((s) => (
                  <div className={"dash-stat" + (s.hot ? " is-hot" : "")} key={s.label}>
                    <div className="dash-stat-top">
                      <span className="dash-stat-label">{s.label}</span>
                      <Icon name={s.icon} size={11} />
                    </div>
                    <strong>{s.value}</strong>
                    <span className="dash-stat-note">{s.note}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="dash-card is-blue dash-badges-card" aria-label="Badges">
              <div className="dash-card-head">
                <h2 className="dash-card-title">
                  <Icon name="shield" size={14} /> Badges
                  <span className="dash-muted">• Pencapaian Terbaru</span>
                </h2>
                <span className="dash-pill">
                  {collected} / {BADGES.length} Dikoleksi
                </span>
              </div>

              <div className="dash-badges">
                {BADGES.map((b) => (
                  <article className={"dash-badge" + (b.done ? "" : " is-locked")} key={b.level}>
                    <div className="dash-badge-top">
                      <span className={"dash-badge-icon tone-" + b.tone}>
                        <Icon name={b.icon} size={13} />
                      </span>
                      <span className={"dash-badge-xp" + (b.hot ? " is-hot" : "")}>{b.xp}</span>
                    </div>
                    <strong>Level {b.level}</strong>
                    <span className="dash-badge-sub">{b.name}</span>

                    {b.done ? (
                      <div className="dash-badge-foot">
                        <span>Terbuka</span>
                        <Icon name="check" size={11} />
                      </div>
                    ) : (
                      <div className="dash-badge-progress">
                        <div className="dash-badge-foot">
                          <span>Progress</span>
                          <span>
                            {b.progress} / {b.total}
                          </span>
                        </div>
                        <div
                          className="dash-badge-bar"
                          role="progressbar"
                          aria-valuenow={b.progress}
                          aria-valuemin="0"
                          aria-valuemax={b.total}
                          aria-label={"Progres Level " + b.level}
                        >
                          <span style={{ width: (b.progress / b.total) * 100 + "%" }} />
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* ---------- Kolom kanan: leaderboard ---------- */}
          <section className="dash-card dash-board" aria-label="Leaderboard">
            <div className="dash-card-head">
              <h2 className="dash-card-title">
                <span className="dash-trophy">
                  <Icon name="trophy" size={14} />
                </span>{" "}
                Leaderboard
              </h2>
            </div>

            <div className="dash-podium">
              {LEADERBOARD.podium.map((p) => (
                <div className={"dash-podium-item rank-" + p.rank} key={p.rank}>
                  <strong>{p.name}</strong>
                  <span className="dash-podium-xp">{p.xp}</span>
                  <span className="dash-podium-rank">{p.rank}</span>
                  {p.rank === 1 && <span className="dash-podium-tag">Top Coder</span>}
                </div>
              ))}
            </div>

            <ol className="dash-rank-list">
              {LEADERBOARD.ranking.map((r) => (
                <li className={r.me ? "is-me" : ""} key={r.rank}>
                  <span className="dash-rank-no">{r.me ? "#" + r.rank : r.rank}</span>
                  <span className="dash-avatar">{r.me ? "" : initials(r.name)}</span>
                  <span className="dash-rank-name">
                    <b>
                      {r.name}
                      {r.me && <span className="dash-sr"> (kamu)</span>}
                    </b>
                    {r.note && <small>{r.note}</small>}
                  </span>
                  <span className="dash-rank-xp">{r.xp}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <footer className="dash-footer">
        © 2026 PyVenture Expedition Corp. All rights reserved. Built for deep-flow learning.
      </footer>
    </div>
  );
}