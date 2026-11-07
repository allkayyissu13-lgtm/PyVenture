import { Link } from "react-router-dom";
import "./Navbar.css";

const TABS = [
  { key: "home", label: "Beranda", to: "/dashboard" },
  { key: "modul", label: "Modul & Materi", to: "/modul" },
  { key: "quest", label: "Quest & Latihan", to: "/quest" },
];

/* active: "home" | "modul" | "quest" */
export default function Navbar({ active }) {
  return (
    <header className="nv">
      <div className="nv-inner">
        <Link to="/dashboard" className="nv-brand">
          <img className="nv-logo" src="/pyventure.png" alt="" />
          PyVenture
        </Link>

        <nav className="nv-tabs" aria-label="Menu utama">
          {TABS.map((t) => (
            <Link
              key={t.key}
              to={t.to}
              className={"nv-tab" + (active === t.key ? " is-active" : "")}
              aria-current={active === t.key ? "page" : undefined}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <label className="nv-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input type="search" placeholder="Cari modul, syntax, atau quest ..." aria-label="Cari" />
        </label>
      </div>
    </header>
  );
}