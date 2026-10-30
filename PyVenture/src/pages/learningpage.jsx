import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "./learningpage.css";

/* ---------- Data contoh (ganti dengan data dari API kamu) ---------- */
const MODULES = [
  { id: 1, title: "Python Dasar", desc: "Deskripsi Modul", progress: 45 },
  { id: 2, title: "Struktur Kontrol", desc: "Deskripsi Modul", progress: 30 },
  { id: 3, title: "Struktur Data", desc: "Deskripsi Modul", locked: true, solved: 0, total: 6 },
  { id: 4, title: "Fungsi & Modul", desc: "Deskripsi Modul", locked: true, solved: 0, total: 6 },
  { id: 5, title: "OOP", desc: "Deskripsi Modul", locked: true, solved: 0, total: 6 },
];

const DocIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);

const ShieldLockIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.5l8 3v6c0 5-3.5 8.500-8 10-4.500-1.500-8-5-8-10v-6z" fill="#fff" />
    <rect x="8.500" y="10.500" width="7" height="5.500" rx="1" fill="#283147" />
    <path d="M10 10.500V9a2 2 0 0 1 4 0v1.500" fill="none" stroke="#283147" strokeWidth="1.600" />
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 3l15 9-15 9z" />
  </svg>
);

export default function LearningPage() {
  return (
    <div className="learn-page">
      <Navbar active="modul" />

      <main className="learn-main">
        <h1 className="learn-title">Modul Pembelajaran</h1>

        <ul className="learn-list">
          {MODULES.map((m) => (
            <li className={`learn-card${m.locked ? " is-locked" : ""}`} key={m.id}>
              <span className="learn-icon">{m.locked ? <ShieldLockIcon /> : <DocIcon />}</span>

              <div className="learn-body">
                <h2 className="learn-name">
                  {m.id}. {m.title}
                </h2>
                <p className="learn-desc">{m.desc}</p>

                {m.locked ? (
                  <p className="learn-solved">
                    {m.solved}/{m.total} soal selesai
                  </p>
                ) : (
                  <div className="learn-progress">
                    <div
                      className="learn-bar"
                      role="progressbar"
                      aria-valuenow={m.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`Progres ${m.title}`}
                    >
                      <span style={{ width: `${m.progress}%` }} />
                    </div>
                    <span className="learn-pct">{m.progress}%</span>
                  </div>
                )}
              </div>

              {m.locked ? (
                <span className="learn-play is-disabled" role="img" aria-label={`${m.title} masih terkunci`}>
                  <PlayIcon />
                </span>
              ) : (
                <Link to="/quest" className="learn-play" aria-label={`Lanjutkan ${m.title}`}>
                  <PlayIcon />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </main>

      <footer className="learn-footer">
        © 2026 PyVenture Expedition Corp. All rights reserved. Built for deep-flow learning.
      </footer>
    </div>
  );
}