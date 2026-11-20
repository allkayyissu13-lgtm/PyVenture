import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import "./competitionpage.css";

export default function CompetitionPage() {
  return (
    <div className="comp-page">
      <Navbar active="kompetisi" />

      <main className="comp-main">
        <h1 className="comp-title">Kompetisi</h1>
        <p className="comp-note">Halaman kompetisi sedang disiapkan.</p>
      </main>

      <Footer />
    </div>
  );
}