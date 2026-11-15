import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MODULES } from "../data/modules.js";
import "./Navbar.css";

const TABS = [
  { key: "home", label: "Beranda", to: "/dashboard" },
  { key: "modul", label: "Modul & Materi", to: "/modul" },
  { key: "quest", label: "Quest & Latihan", to: "/quest" },
  { key: "kompetisi", label: "Kompetisi", to: "/kompetisi" },
];

/* Indeks pencarian: modul, materi, dan soal dari data modul */
function buildIndex() {
  const items = [];
  MODULES.forEach((m) => {
    items.push({
      key: "m-" + m.id,
      title: m.title,
      sub: m.desc || "Modul",
      to: "/modul/" + m.id,
    });
    (m.materi || []).forEach((t, i) => {
      items.push({
        key: "t-" + m.id + "-" + i,
        title: t.title,
        sub: "Materi • " + m.title,
        to: "/modul/" + m.id,
      });
    });
    (m.quiz || []).forEach((q, i) => {
      const isObj = typeof q === "object";
      items.push({
        key: "q-" + m.id + "-" + i,
        title: isObj ? q.title : q,
        sub: "Soal • " + m.title,
        to: isObj ? "/quest/" + m.id + "/" + q.id : "/modul/" + m.id,
      });
    });
  });
  return items;
}

const INDEX = buildIndex();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, query }) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp("(" + escapeRe(q) + ")", "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : p
  );
}

function search(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return INDEX.filter((it) => it.title.toLowerCase().includes(q))
    .sort((a, b) => {
      // judul yang diawali kata kunci tampil lebih dulu
      const sa = a.title.toLowerCase().startsWith(q) ? 0 : 1;
      const sb = b.title.toLowerCase().startsWith(q) ? 0 : 1;
      return sa - sb;
    })
    .slice(0, 6);
}

/* active: "home" | "modul" | "quest" | "kompetisi" */
export default function Navbar({ active }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const wrapRef = useRef(null);

  const results = search(query);
  const showList = open && query.trim() !== "";

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (item) => {
    navigate(item.to);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setOpen(true);
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && showList && results[cursor]) {
      e.preventDefault();
      go(results[cursor]);
    }
  };

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

        <div className="nv-search-wrap" ref={wrapRef}>
          <label className="nv-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              type="search"
              placeholder="Cari modul, syntax, atau quest ..."
              aria-label="Cari"
              role="combobox"
              aria-expanded={showList}
              aria-controls="nv-results"
              aria-autocomplete="list"
              aria-activedescendant={showList && results[cursor] ? "nv-opt-" + cursor : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setCursor(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              autoComplete="off"
            />
          </label>

          {showList && (
            <ul className="nv-results" id="nv-results" role="listbox" aria-label="Hasil pencarian">
              {results.length === 0 ? (
                <li className="nv-empty" role="presentation">
                  Tidak ada hasil untuk “{query.trim()}”.
                </li>
              ) : (
                results.map((r, i) => (
                  <li
                    key={r.key}
                    id={"nv-opt-" + i}
                    role="option"
                    aria-selected={i === cursor}
                    className={"nv-result" + (i === cursor ? " is-active" : "")}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(r)}
                  >
                    <span className="nv-result-title">
                      <Highlight text={r.title} query={query} />
                    </span>
                    <span className="nv-result-sub">{r.sub}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}