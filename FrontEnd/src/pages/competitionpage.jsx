import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import LiveStandings from "../components/LiveStandings.jsx";
import NewCompetitionDialog from "../components/NewCompetitionDialog.jsx";
import { addCompetition, formatRupiah, getAllCompetitions } from "../data/competitions.js";
import { formatRemaining, useNow } from "../lib/useNow.js";
import "./competitionpage.css";

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 19V5M9 8h6" />
  </svg>
);

export default function CompetitionPage() {
  const now = useNow();
  const [list, setList] = useState(getAllCompetitions);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = (data) => {
    addCompetition(data);
    setList(getAllCompetitions());
    setDialogOpen(false);
  };

  return (
    <div className="comp-page">
      <Navbar active="kompetisi" />

      <main className="comp-main">
        {/* ---------- Hero ---------- */}
        <section className="comp-hero">
          <div className="comp-hero-text">
            <span className="comp-badge">
              <i /> Arena Kompetisi
            </span>
            <h1>Arena Kompetisi &amp; Turnamen Koding</h1>
            <p>
              Tantang kemampuan sintaksis, kecepatan algoritma, dan optimasi Big-O realtime. Setiap
              kompetisi dilengkapi papan peringkat independen terverifikasi runtime.
            </p>
          </div>
          <button type="button" className="comp-new" onClick={() => setDialogOpen(true)}>
            + New Competitions
          </button>
        </section>

        {/* ---------- Daftar kompetisi ---------- */}
        {list.map((c) => {
          const time = formatRemaining(c.endsAt - now);
          const ended = time === null;
          return (
            <article className="comp-card" key={c.id} aria-label={c.name}>
              <div className="comp-card-main">
                <div className="comp-tags">
                  <span className={"comp-live" + (ended ? " is-ended" : "")}>
                    <i /> {ended ? "Selesai" : "Sedang Berlangsung"}
                  </span>
                  {c.privacy === "private" && <span className="comp-private">Private</span>}
                </div>

                <h2 className="comp-name">{c.name}</h2>
                <p className="comp-desc">{c.desc}</p>

                <div className="comp-stats">
                  <div>
                    <span className="comp-stat-label">Sisa Waktu</span>
                    <strong className="comp-timer" role="timer">
                      {time ?? "00:00:00"} <small>HRS</small>
                    </strong>
                  </div>
                  <div>
                    <span className="comp-stat-label">Total Hadiah Pool</span>
                    <strong className="comp-prize">{formatRupiah(c.prizePool)}</strong>
                    {c.rewardNote && <span className="comp-prize-note">{c.rewardNote}</span>}
                  </div>
                </div>

                <div className="comp-actions">
                  <Link to={"/kompetisi/" + c.id} className="comp-btn-amber">
                    Mulai Eksekusi Koding
                  </Link>
                  <Link to={"/kompetisi/" + c.id} className="comp-btn-ghost">
                    <BookIcon /> Lihat Soal &amp; Aturan
                  </Link>
                </div>
              </div>

              <LiveStandings entries={c.standings} />
            </article>
          );
        })}
      </main>

      <footer className="comp-footer">
        © 2026 PyVenture Expedition Corp. All rights reserved. Built for deep-flow learning.
      </footer>

      {dialogOpen && (
        <NewCompetitionDialog onCancel={() => setDialogOpen(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}