import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { DocIcon, BackIcon } from "../components/Icons.jsx";
import { MODULES, getProgress } from "../data/modules.js";
import "./modulepage.css";

function ModuleView({ mod }) {
  const [tab, setTab] = useState("materi");
  const [index, setIndex] = useState(0);

  const total = mod.quiz.length;
  const pct = getProgress(mod);
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
                  aria-label={`Progres ${mod.title}`}
                >
                  <span style={{ width: `${pct}%` }} />
                </div>
                <span className="mod-count">
                  {mod.solved}/{total} soal selesai
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

          <div id="mod-panel" role="tabpanel" aria-labelledby={`mod-tab-${tab}`}>
            {tab === "materi" ? (
              <div className="mod-layout">
                {/* Daftar materi */}
                <nav className="mod-side" aria-label="Daftar materi">
                  <ul>
                    {mod.materi.map((m, i) => (
                      <li key={m.title}>
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
              <section className="mod-content mod-quiz" aria-label="Daftar soal quiz">
                <h2 className="mod-content-title">Quiz {mod.title}</h2>
                <p className="mod-content-desc">
                  Selesaikan semua soal untuk membuka modul berikutnya.
                </p>

                <ol className="mod-quiz-list">
                  {mod.quiz.map((q, i) => {
                    const done = i < mod.solved;
                    return (
                      <li key={q}>
                        <span className="mod-quiz-no">{i + 1}</span>
                        <span className="mod-quiz-name">{q}</span>
                        {done ? (
                          <span className="mod-quiz-done">Selesai</span>
                        ) : (
                          <Link to="/quest" className="mod-quiz-go">
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

      <Footer />
    </div>
  );
}

export default function ModulePage() {
  const { id } = useParams();
  const mod = MODULES.find((m) => String(m.id) === id);

  // Modul tidak ada atau masih terkunci: kembali ke daftar modul
  if (!mod || mod.locked) return <Navigate to="/modul" replace />;

  // key membuat tab dan materi terpilih kembali ke awal saat pindah modul
  return <ModuleView key={mod.id} mod={mod} />;
}