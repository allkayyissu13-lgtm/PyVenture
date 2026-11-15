import Navbar from "../components/Navbar.jsx";
import "./competitionpage.css";

export default function CompetitionPage() {
  return (
    <div className="comp-page">
      <Navbar active="kompetisi" />

      <main className="comp-main">
        <h1 className="comp-title">Kompetisi</h1>
        <p className="comp-note">Halaman kompetisi sedang disiapkan.</p>
      </main>

      <footer className="comp-footer">
        © 2026 PyVenture Expedition Corp. All rights reserved. Built for deep-flow learning.
      </footer>
    </div>
  );
}