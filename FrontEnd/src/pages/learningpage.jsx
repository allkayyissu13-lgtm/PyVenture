import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { DocIcon, ShieldLockIcon, PlayIcon } from "../components/Icons.jsx";
import { MODULES, getProgress } from "../data/modules.js";
import "./learningpage.css";

export default function LearningPage() {
  return (
    <div className="learn-page">
      <Navbar active="modul" />

      <main className="learn-main">
        <h1 className="learn-title">Modul Pembelajaran</h1>

        <ul className="learn-list">
          {MODULES.map((m) => {
            const total = m.quiz.length;
            const pct = getProgress(m);
            return (
              <li className={"learn-card" + (m.locked ? " is-locked" : "")} key={m.id}>
                <span className="learn-icon">{m.locked ? <ShieldLockIcon /> : <DocIcon />}</span>

                <div className="learn-body">
                  <h2 className="learn-name">
                    {m.id}. {m.title}
                  </h2>
                  <p className="learn-desc">{m.desc}</p>

                  {m.locked ? (
                    <p className="learn-solved">
                      {m.solved}/{total} soal selesai
                    </p>
                  ) : (
                    <div className="learn-progress">
                      <div
                        className="learn-bar"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={"Progres " + m.title}
                      >
                        <span style={{ width: pct + "%" }} />
                      </div>
                      <span className="learn-pct">{pct}%</span>
                    </div>
                  )}
                </div>

                {m.locked ? (
                  <span className="learn-play is-disabled" role="img" aria-label={m.title + " masih terkunci"}>
                    <PlayIcon />
                  </span>
                ) : (
                  <Link to={"/modul/" + m.id} className="learn-play" aria-label={"Buka " + m.title}>
                    <PlayIcon />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </main>

      <Footer />
    </div>
  );
}