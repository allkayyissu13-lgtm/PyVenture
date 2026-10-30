import { Link } from "react-router-dom";
import "./Navbar.css";

const TABS = [
  { key: "home", label: "Beranda", to: "/dashboard" },
  { key: "modul", label: "Modul & Materi", to: "/modul" },
  { key: "quest", label: "Quest & Latihan", to: "/quest" },
];

const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2C7 2 7 4 7 6v2h5v1H5C3 9 2 11 2 14s1 5 3 5h2v-3c0-2 2-3 4-3h5c2 0 3-1 3-3V6c0-2-2-4-7-4z"
      fill="#3b82d6"
    />
    <path
      d="M12 22c5 0 5-2 5-4v-2h-5v-1h7c2 0 3-2 3-5s-1-5-3-5h-2v3c0 2-2 3-4 3H8c-2 0-3 1-3 3v3c0 2 2 4 7 4z"
      fill="#f2c94c"
    />
    <circle cx="9.5" cy="5" r="1" fill="#fff" />
    <circle cx="14.5" cy="19" r="1" fill="#fff" />
  </svg>
);

/* active: "home" | "modul" | "quest" */
export default function Navbar({ active }) {
  return (
    <header className="nv">
      <Link to="/dashboard" className="nv-brand">
        <LogoMark /> PyVenture
      </Link>

      <nav className="nv-tabs" aria-label="Menu utama">
        {TABS.map((t) => (
          <Link
            key={t.key}
            to={t.to}
            className={`nv-tab${active === t.key ? " is-active" : ""}`}
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
    </header>
  );
}