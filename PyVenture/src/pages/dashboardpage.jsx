import { Link, useNavigate } from "react-router-dom";
import "./dashboardpage.css";

/* ---------- Data contoh (ganti dengan data dari API kamu) ---------- */
const USER = { name: "Nama Pengguna", handle: "@username", level: 7, xp: 850, xpMax: 1200 };

const STATS = [
  { label: "Total XP", value: "850", note: "", icon: "xp" },
  { label: "Streak", value: "14 Hari", note: "Aktif berturut", icon: "flame" },
  { label: "Akurasi", value: "94%", note: "Total Quest", icon: "target" },
  { label: "Quest", value: "8", note: "1 x Bonus", icon: "flag" },
];

const BADGES = [
  { name: "Python Dasar", sub: "Eksekusi Modul", xp: "+20", done: true },
  { name: "Struktur Kontrol", sub: "Eksekusi Modul", xp: "+100", done: true },
  { name: "Struktur Data", sub: "Eksekusi Modul", xp: "+150", done: true },
  { name: "Fungsi & Modul", sub: "Eksekusi Modul", xp: "+150", done: true },
  { name: "OOP", sub: "Eksekusi Modul", xp: "+150", done: true },
  { name: "Proyek Akhir", sub: "Eksekusi Modul", xp: "+300", done: false, progress: 7, total: 21 },
];

const PODIUM = [
  { rank: 2, name: "Fazal", xp: "4,120" },
  { rank: 1, name: "Sihatang", xp: "4,490" },
  { rank: 3, name: "Azahra", xp: "3,990" },
];

const RANKING = [
  { rank: 4, name: "Laren Ashley", xp: "3,720" },
  { rank: 5, name: "Zowhwen Alerizi", xp: "3,640" },
  { rank: 6, name: "Barra Allapydya", xp: "3,510" },
  { rank: 7, name: "Rushwa Bava", xp: "3,450", me: true },
  { rank: 8, name: "Indah Winatha", xp: "3,310" },
];

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------- Ikon ---------- */
const Icon = ({ name, size = 14 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
    flag: <><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>,
    xp: <path d="M12 2l2.6 6.4L21 9l-5 4.4L17.5 20 12 16.600 6.500 20 8 13.400 3 9l6.400-.6z" />,
    flame: <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" /></>,
    shield: <path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z" />,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    play: <path d="M7 4l13 8-13 8z" />,
    doc: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    logout: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5M15 12H3" /></>,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

/* ---------- Halaman ---------- */
export default function DashboardPage() {
  const navigate = useNavigate();
  const pct = Math.floor((USER.xp / USER.xpMax) * 100);
  const collected = BADGES.filter((b) => b.done).length;

  const noop = (e) => e.preventDefault(); // placeholder untuk menu yang belum punya halaman

  return (
    <div className="dash-page">
      <div className="dash-shell">
        {/* ---------- Navbar ---------- */}
        <header className="dash-nav">
          <Link to="/dashboard" className="dash-brand">PyVenture</Link>

          <nav className="dash-tabs" aria-label="Menu utama">
            <Link to="/dashboard" className="dash-tab is-active" aria-current="page">
              Beranda
            </Link>
            <button type="button" className="dash-tab" onClick={noop}>Modul &amp; Materi</button>
            <button type="button" className="dash-tab" onClick={noop}>Quest &amp; Latihan</button>
          </nav>

          <label className="dash-search">
            <Icon name="search" size={13} />
            <input type="search" placeholder="Cari modul, quest, atau sesi ..." aria-label="Cari" />
          </label>

          <button type="button" className="dash-logout" onClick={() => navigate("/login")}>
            <Icon name="logout" size={13} /> Keluar
          </button>
        </header>

        <main className="dash-main">
          {/* ---------- Banner quest ---------- */}
          <section className="dash-quest" aria-label="Quest aktif">
            <span className="dash-quest-icon"><Icon name="flag" size={16} /></span>
            <div className="dash-quest-text">
              <span className="dash-mono">Expedition Quest</span>
              <strong>Lanjutkan Quest:</strong>
            </div>
            <span className="dash-quest-mod">Modul 4 • Judul Modul</span>
            <div className="dash-quest-actions">
              <button type="button" className="dash-btn-ghost" onClick={noop}>
                <Icon name="doc" size={12} /> Briefing
              </button>
              <button type="button" className="dash-btn-peach" onClick={noop}>
                Mulai Eksekusi <Icon name="play" size={10} />
              </button>
            </div>
          </section>

          <div className="dash-grid">
            {/* ---------- Kolom kiri ---------- */}
            <div className="dash-col">
              <section className="dash-card" aria-label="Profil">
                <div className="dash-profile-head">
                  <h2 className="dash-profile-name">
                    {USER.name} <small>({USER.handle})</small>
                  </h2>
                  <span className="dash-mono">
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
                  <span style={{ width: `${pct}%` }} />
                </div>

                <div className="dash-stats">
                  {STATS.map((s) => (
                    <div className="dash-stat" key={s.label}>
                      <div className="dash-stat-top">
                        <span className="dash-mono">{s.label}</span>
                        <Icon name={s.icon} size={11} />
                      </div>
                      <strong>{s.value}</strong>
                      {s.note && <span className="dash-stat-note">{s.note}</span>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="dash-card" aria-label="Badges">
                <div className="dash-card-head">
                  <h2 className="dash-card-title">
                    <Icon name="shield" size={14} /> Badges
                    <span className="dash-muted">• Pencapaian Terbaru</span>
                  </h2>
                  <span className="dash-pill">{collected} / {BADGES.length} Dikoleksi</span>
                </div>

                <div className="dash-badges">
                  {BADGES.map((b) => (
                    <article className={`dash-badge${b.done ? "" : " is-locked"}`} key={b.name}>
                      <div className="dash-badge-top">
                        <span className="dash-badge-icon">
                          <Icon name={b.done ? "shield" : "lock"} size={14} />
                        </span>
                        <span className="dash-badge-xp">{b.xp}</span>
                      </div>
                      <strong>{b.name}</strong>
                      <span className="dash-badge-sub">{b.sub}</span>
                      {b.done ? (
                        <span className="dash-badge-status">Terbuka</span>
                      ) : (
                        <>
                          <div className="dash-badge-bar">
                            <span style={{ width: `${(b.progress / b.total) * 100}%` }} />
                          </div>
                          <span className="dash-badge-status">{b.progress} / {b.total}</span>
                        </>
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
                  <Icon name="trophy" size={14} /> Leaderboard
                </h2>
                <span className="dash-pill">Reset 3h 6m</span>
              </div>

              <div className="dash-seg" role="tablist" aria-label="Periode">
                <button type="button" role="tab" aria-selected="true" className="is-active">Mingguan</button>
                <button type="button" role="tab" aria-selected="false" onClick={noop}>Bulanan</button>
                <button type="button" role="tab" aria-selected="false" onClick={noop}>Semua Masa</button>
              </div>

              <div className="dash-podium">
                {PODIUM.map((p) => (
                  <div className={`dash-podium-item rank-${p.rank}`} key={p.rank}>
                    <span className="dash-avatar">{initials(p.name)}</span>
                    <strong>{p.name}</strong>
                    <span className="dash-podium-xp">{p.xp}</span>
                    <span className="dash-podium-rank">{p.rank}</span>
                  </div>
                ))}
              </div>

              <ol className="dash-rank-list">
                {RANKING.map((r) => (
                  <li className={r.me ? "is-me" : ""} key={r.rank}>
                    <span className="dash-rank-no">{r.rank}</span>
                    <span className="dash-avatar sm">{initials(r.name)}</span>
                    <span className="dash-rank-name">
                      {r.name}
                      {r.me && <em>Kamu</em>}
                    </span>
                    <span className="dash-rank-xp">{r.xp}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </main>

        <footer className="dash-footer">
          © 2026 PyVenture Expedition Corp. All rights reserved. Built for deep-frost learning.
        </footer>
      </div>
    </div>
  );
}