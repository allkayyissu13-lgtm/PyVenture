import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { MODULES } from "../data/modules.js";
import { getProgress, getSolvedIds, isUnlocked } from "../lib/progress.js";
import "./modulepage.css";

const DocIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

function ModuleView({ mod }) {
  const [tab, setTab] = useState("materi");
  const [index, setIndex] = useState(0);

  const total = mod.quiz.length;
  const solvedIds = getSolvedIds(mod.id);
  const solved = solvedIds.filter((id) => mod.quiz.some((q) => q.id === id)).length;
  const pct = getProgress(mod);

  const hasMateri = mod.materi.length > 0;
  const current = mod.materi[index];
  const isLast = index === mod.materi.length - 1;

  const goNext = () => {
    if (isLast) setTab("quiz");
    else setIndex(index + 1);
  };

  return (
    <div className="mod-page">
      <Navbar active="modul" />

      <main className="mod-main">
        <Link to="/modul" className="mod-back">
          <BackIcon /> Kembali ke Modul
        </Link>

        <div className="mod-wrap">
          {/* ---------- Header modul ---------- */}
          <header className="mod-head">
            <span className="mod-icon">
              <DocIcon />
            </span>
            <div className="mod-head-body">
              <h1 className="mod-name">
                {mod.id}. {mod.title}
              </h1>
              <p className="mod-desc">{mod.desc}</p>
              <div className="mod-progress">
                <div
                  className="mod-bar"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={"Progres " + mod.title}
                >
                  <span style={{ width: pct + "%" }} />
                </div>
                <span className="mod-count">
                  {solved}/{total} soal selesai
                </span>
              </div>
            </div>
          </header>

          {/* ---------- Tab ---------- */}
          <div className="mod-tabs" role="tablist" aria-label="Isi modul">
            <button
              type="button"
              role="tab"
              id="mod-tab-materi"
              aria-selected={tab === "materi"}
              aria-controls="mod-panel"
              className={tab === "materi" ? "is-active" : ""}
              onClick={() => setTab("materi")}
            >
              Materi
            </button>
            <button
              type="button"
              role="tab"
              id="mod-tab-quiz"
              aria-selected={tab === "quiz"}
              aria-controls="mod-panel"
              className={tab === "quiz" ? "is-active" : ""}
              onClick={() => setTab("quiz")}
            >
              Quiz
            </button>
          </div>

          <div id="mod-panel" role="tabpanel" aria-labelledby={"mod-tab-" + tab}>
            {tab === "materi" ? (
              hasMateri ? (
                <div className="mod-layout">
                  {/* Daftar materi */}
                  <nav className="mod-side" aria-label="Daftar materi">
                    <ul>
                      {mod.materi.map((m, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            className={i === index ? "is-active" : ""}
                            aria-current={i === index ? "true" : undefined}
                            onClick={() => setIndex(i)}
                          >
                            {i + 1}. {m.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  {/* Isi materi */}
                  <article className="mod-content">
                    <h2 className="mod-content-title">
                      {index + 1}. {current.title}
                    </h2>
                    <p className="mod-content-desc">{current.desc}</p>

                    <h3 className="mod-code-label">Contoh Kode</h3>
                    <pre className="mod-code">
                      <code>{current.code}</code>
                    </pre>

                    <button type="button" className="mod-next" onClick={goNext}>
                      {isLast ? "Mulai Quiz" : "Selanjutnya"} &gt;
                    </button>
                  </article>
                </div>
              ) : (
                <section className="mod-content" aria-label="Materi">
                  <h2 className="mod-content-title">Materi belum tersedia</h2>
                  <p className="mod-content-desc">Materi untuk modul ini sedang disiapkan.</p>
                </section>
              )
            ) : (
              <section className="mod-content mod-quiz" aria-label="Daftar soal quiz">
                <h2 className="mod-content-title">Quiz {mod.title}</h2>
                <p className="mod-content-desc">
                  Selesaikan semua soal untuk membuka modul berikutnya.
                </p>

                <ol className="mod-quiz-list">
                  {mod.quiz.map((q, i) => {
                    const done = solvedIds.includes(q.id);
                    return (
                      <li key={q.id}>
                        <span className="mod-quiz-no">{i + 1}</span>
                        <span className="mod-quiz-name">{q.title}</span>
                        {done ? (
                          <span className="mod-quiz-done">Selesai</span>
                        ) : (
                          <Link to={"/quest/" + mod.id + "/" + q.id} className="mod-quiz-go">
                            Kerjakan
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="mod-footer">
        © 2026 PyVenture Expedition Corp. All rights reserved. Built for deep-flow learning.
      </footer>
    </div>
  );
}

export default function ModulePage() {
  const { id } = useParams();
  const index = MODULES.findIndex((m) => String(m.id) === id);

  // Modul tidak ada atau masih terkunci: kembali ke daftar modul
  if (index < 0 || !isUnlocked(MODULES, index)) return <Navigate to="/modul" replace />;

  // key membuat tab dan materi terpilih kembali ke awal saat pindah modul
  return <ModuleView key={MODULES[index].id} mod={MODULES[index]} />;
}