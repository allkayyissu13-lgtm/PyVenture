import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Icon } from "../components/Icons.jsx";
import { getDashboard, getSession } from "../lib/api.js";
import "./dashboardpage.css";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getSession()) {
      navigate("/login");
      return;
    }

    let ignore = false;
    getDashboard()
      .then((res) => {
        if (!ignore) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          if (!getSession()) {
            navigate("/login");
            return;
          }
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [navigate]);

  if (loading && !data) {
    return (
      <div className="dash-page">
        <Navbar active="home" />
        <div
          className="dash-shell"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <p style={{ color: "var(--d-dim)" }}>Menghubungkan ke pusat data ekspedisi…</p>
        </div>
        <Footer />
      </div>
    );
  }

  const user = data?.user ?? {
    name: "Petualang",
    handle: "@petualang",
    level: 1,
    xp: 0,
    xp_max: 100,
    level_progress_pct: 0,
  };

  const stats = data?.stats ?? [
    { label: "Total Poin", value: "0", note: "Total XP", icon: "bolt" },
    { label: "Streak", value: "1 Hari", note: "Aktif berturut", icon: "flame", hot: true },
    { label: "Akurasi", value: "100%", note: "0 Submisi", icon: "target" },
    { label: "Quest", value: "0", note: "/ 11 Latihan", icon: "check" },
  ];

  const quest = data?.quest ?? {
    active: true,
    tag: "Expedition Quest",
    track_title: "Dasar Python",
    stage_title: "Halo, Python!",
    exercise_title: "Menyapa Pengguna",
    link: "/quest",
  };

  const badges = data?.badges ?? [];
  const podium = data?.leaderboard?.podium ?? [];
  const ranking = data?.leaderboard?.ranking ?? [];

  const pct = user.level_progress_pct ?? Math.round((user.xp / (user.xp_max || 1)) * 100);
  const collected = badges.filter((b) => b.done).length;

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
              <span className="dash-quest-tag">{quest.tag}</span>
              <span className="dash-quest-mod">
                {quest.track_title} • {quest.stage_title}
              </span>
            </p>
            <strong>
              {quest.exercise_title ? `Lanjutkan: ${quest.exercise_title}` : "Lanjutkan Quest:"}
            </strong>
          </div>
          <Link to={quest.link || "/quest"} className="dash-btn-peach">
            Mulai Eksekusi <Icon name="play" size={9} solid />
          </Link>
        </section>

        <div className="dash-grid">
          {/* ---------- Kolom kiri ---------- */}
          <div className="dash-col">
            <section className="dash-card" aria-label="Profil">
              <div className="dash-profile-head">
                <h2 className="dash-profile-name">
                  {user.name} <small>({user.handle})</small>
                </h2>
                <span className="dash-profile-xp">
                  {pct}% • {user.xp} / {(user.xp_max || 100).toLocaleString("en-US")} XP
                </span>
              </div>
              <p className="dash-level">Level {user.level}</p>
              <div
                className="dash-progress"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Progres level"
              >
                <span style={{ width: Math.min(100, Math.max(0, pct)) + "%" }} />
              </div>

              <div className="dash-stats">
                {stats.map((s) => (
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
                  <span className="dash-muted">• Pencapaian</span>
                </h2>
                <span className="dash-pill">
                  {collected} / {badges.length} Dikoleksi
                </span>
              </div>

              <div className="dash-badges">
                {badges.map((b) => (
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
                            {b.progress ?? 0} / {b.total ?? 1}
                          </span>
                        </div>
                        <div
                          className="dash-badge-bar"
                          role="progressbar"
                          aria-valuenow={b.progress ?? 0}
                          aria-valuemin="0"
                          aria-valuemax={b.total ?? 1}
                          aria-label={"Progres Level " + b.level}
                        >
                          <span
                            style={{
                              width:
                                Math.min(
                                  100,
                                  Math.round(((b.progress || 0) / (b.total || 1)) * 100)
                                ) + "%",
                            }}
                          />
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
              {podium.map((p) => (
                <div className={"dash-podium-item rank-" + p.rank} key={p.rank}>
                  <strong>{p.name}</strong>
                  <span className="dash-podium-xp">{p.xp}</span>
                  <span className="dash-podium-rank">{p.rank}</span>
                  {p.rank === 1 && <span className="dash-podium-tag">Top Coder</span>}
                </div>
              ))}
            </div>

            <ol className="dash-rank-list">
              {ranking.map((r) => (
                <li className={r.me ? "is-me" : ""} key={r.rank + "-" + r.name}>
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

      <Footer />
    </div>
  );
}
