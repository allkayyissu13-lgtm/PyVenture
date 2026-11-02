import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "./codepage.css";

/* ---------- Data contoh (ganti dengan data dari API kamu) ---------- */
const CHALLENGE = {
  track: "Inspeksi Gletser Utara",
  chapter: "Bab 1:",
  level: "Level • Bab 1",
  title: "Tantangan E3: Filter Suhu Ekstrem Arktik",
  subtitle: "Deskripsi Tantangan",
  difficulty: "Easy Challenge",
  topic: "Judul Materi",
  description: "Deskripsi soal Python",
  input: "", // contoh format masukan
  output: "", // contoh format keluaran
};

const LEVELS = [
  { id: "E1", label: "Level 1", state: "done" },
  { id: "E2", label: "Level 2", state: "done" },
  { id: "E3", label: "Level 3", state: "active" },
  { id: "E4", label: "Level 4", state: "locked" },
];

const HINTS = [
  "Baca masukan baris demi baris, lalu ubah tiap nilai menjadi angka.",
  "Gunakan perulangan dan kondisi untuk menyaring suhu yang ekstrem.",
  "Cetak hasil akhir dengan print() sesuai format keluaran.",
];

const TEST_CASES = ["Test Case 1", "Test Case 2", "Test Case 3"];

/* GANTI dengan penilaian sungguhan (API / Pyodide).
   Sementara: semua lulus jika kode mengandung "print(",
   selain itu Test Case 1 & 2 gagal dan Test Case 3 lulus. */
function judge(code) {
  const passAll = code.includes("print(");
  return TEST_CASES.map((name, i) => ({ name, ok: passAll || i === 2 }));
}

const STORAGE_KEY = "pyventure-solution";
const loadCode = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ---------- Ikon ---------- */
const PATHS = {
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z" />,
  check: <path d="M5 12l5 5 9-10" />,
  star: <path d="M12 2l2.6 6.4L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.4-.6z" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  file: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5" /></>,
  refresh: <path d="M20 11a8 8 0 1 0-2 6M20 5v6h-6" />,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 10l3 2-3 2M13 15h4" /></>,
  play: <path d="M7 4l13 8-13 8z" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  list: <path d="M4 6h16M4 12h16M4 18h10" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  input: <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />,
  output: <path d="M14 7l5 5-5 5M19 12H7M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />,
};

const Ic = ({ name, size = 14, fill = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {PATHS[name]}
  </svg>
);

/* ---------- Halaman ---------- */
export default function CodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(loadCode);
  const [lines, setLines] = useState([]);
  const [stats, setStats] = useState(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const gutterRef = useRef(null);
  const runTimer = useRef(null);
  const escapeTab = useRef(false);

  // Timer pengerjaan
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Simpan kode supaya tidak hilang saat "Coba Lagi"
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* abaikan */
    }
  }, [code]);

  useEffect(() => () => clearTimeout(runTimer.current), []);

  const lineCount = Math.max(13, code.split("\n").length);

  const runCode = () => {
    if (running) return;
    setRunning(true);
    setLines([{ kind: "cmd", text: "$ python solution.py" }]);
    runTimer.current = setTimeout(() => {
      // TODO: jalankan kode lewat API / Pyodide dan tampilkan output aslinya
      setLines([
        { kind: "cmd", text: "$ python solution.py" },
        code.trim()
          ? { kind: "out", text: "(simulasi) Program selesai tanpa error." }
          : { kind: "err", text: "Editor masih kosong. Tulis kode dulu." },
      ]);
      setStats({ ms: 42, mem: "18.4 MB" });
      setRunning(false);
    }, 500);
  };

  const submit = () => {
    const results = judge(code);
    if (results.every((r) => r.ok)) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* abaikan */
      }
      navigate("/quest/success", { state: { points: 50, badge: "Frost Seeker" } });
    } else {
      navigate("/quest/failed", { state: { results } });
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
      return;
    }
    if (e.key === "Escape") {
      escapeTab.current = true; // Esc lalu Tab = pindah fokus keluar dari editor
      return;
    }
    if (e.key === "Tab" && !e.shiftKey) {
      if (escapeTab.current) {
        escapeTab.current = false;
        return;
      }
      e.preventDefault();
      const ta = e.target;
      const { selectionStart: s, selectionEnd: end } = ta;
      setCode(code.slice(0, s) + "    " + code.slice(end));
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = s + 4;
      });
      return;
    }
    escapeTab.current = false;
  };

  const revealHint = () => setHintsUsed((n) => Math.min(n + 1, HINTS.length));

  return (
    <div className="code-page">
      <div className="code-shell">
        <Navbar active="quest" />

        {/* ---------- Header level ---------- */}
        <div className="code-top">
          <div className="code-heading">
            <Link to="/modul" className="code-back">
              <Ic name="back" size={12} /> Kembali ke Modul
            </Link>
            <div>
              <span className="code-mono">Expedition Track • {CHALLENGE.track}</span>
              <strong className="code-chapter">{CHALLENGE.chapter}</strong>
            </div>
          </div>

          <ol className="code-levels" aria-label="Level quest">
            {LEVELS.map((l) => (
              <li
                key={l.id}
                className={`code-level is-${l.state}`}
                aria-current={l.state === "active" ? "step" : undefined}
              >
                <Ic name={l.state === "done" ? "check" : l.state === "active" ? "star" : "lock"} size={11} fill={l.state === "active"} />
                {l.id}: {l.label}
              </li>
            ))}
          </ol>

          <div className="code-meta">
            <span className="code-timer" aria-label="Waktu pengerjaan">
              <Ic name="clock" size={13} /> {formatTime(elapsed)}
            </span>
            <button type="button" className="code-hint-btn" onClick={revealHint} disabled={hintsUsed >= HINTS.length}>
              <Ic name="bulb" size={13} /> Hint Clue ({hintsUsed}/{HINTS.length})
            </button>
          </div>
        </div>

        <div className="code-grid">
          {/* ---------- Panel soal ---------- */}
          <section className="code-brief" aria-label="Instruksi soal">
            <div className="code-brief-head">
              <span className="code-mono">{CHALLENGE.level}</span>
              <span className="code-diff">{CHALLENGE.difficulty}</span>
              <h1 className="code-title">{CHALLENGE.title}</h1>
              <span className="code-mono">{CHALLENGE.subtitle}</span>
            </div>

            <div className="code-brief-tab">
              <span>
                <Ic name="list" size={13} /> Instruksi Soal
              </span>
            </div>

            <div className="code-brief-body">
              <div className="code-topic">
                <span className="code-topic-icon">
                  <Ic name="bolt" size={16} fill />
                </span>
                <div>
                  <span className="code-mono code-topic-label">{CHALLENGE.topic}</span>
                  <p>{CHALLENGE.description}</p>
                </div>
              </div>

              {hintsUsed > 0 && (
                <ol className="code-hints" aria-label="Petunjuk yang dibuka">
                  {HINTS.slice(0, hintsUsed).map((h, i) => (
                    <li key={i}>
                      <strong>Hint {i + 1}:</strong> {h}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="code-io">
              <div>
                <h2 className="code-io-title">
                  <Ic name="input" size={12} /> Format Masukan (Input)
                </h2>
                <pre className="code-io-box">{CHALLENGE.input}</pre>
              </div>
              <div>
                <h2 className="code-io-title is-out">
                  <Ic name="output" size={12} /> Format Keluaran (Output)
                </h2>
                <pre className="code-io-box">{CHALLENGE.output}</pre>
              </div>
            </div>
          </section>

          {/* ---------- Panel editor ---------- */}
          <section className="code-ide" aria-label="Editor kode">
            <div className="code-ide-bar">
              <span className="code-file">
                <Ic name="file" size={12} /> solution.py <i aria-label="belum disimpan ke server" />
              </span>
              <span className="code-ver">
                <span>
                  <Ic name="terminal" size={12} /> Python 3.14
                </span>
                <button
                  type="button"
                  className="code-icon-btn"
                  onClick={() => setCode("")}
                  aria-label="Kosongkan editor"
                  title="Kosongkan editor"
                >
                  <Ic name="refresh" size={12} />
                </button>
              </span>
            </div>

            <div className="code-editor">
              <div className="code-gutter" ref={gutterRef} aria-hidden="true">
                {Array.from({ length: lineCount }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={(e) => {
                  if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
                }}
                placeholder="Kode Python"
                spellCheck={false}
                wrap="off"
                aria-label="Editor kode solution.py"
              />
            </div>

            <div className="code-terminal">
              <div className="code-terminal-bar">
                <span>
                  <Ic name="terminal" size={12} /> Terminal
                </span>
                <span className="code-stats">
                  <i /> {stats ? `${stats.ms} ms / ${stats.mem}` : "— ms / — MB"}
                </span>
              </div>
              <pre className="code-terminal-body" aria-live="polite">
                {lines.length === 0 ? (
                  <span className="code-dim">Output akan tampil di sini.</span>
                ) : (
                  lines.map((l, i) => (
                    <span key={i} className={`code-line is-${l.kind}`}>
                      {l.text}
                    </span>
                  ))
                )}
              </pre>
            </div>

            <div className="code-actions">
              <span className="code-shortcut">
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> untuk Run
              </span>
              <button type="button" className="code-run" onClick={runCode} disabled={running}>
                {running ? "Menjalankan..." : "Jalankan Kode"} <Ic name="play" size={10} fill />
              </button>
              <button type="button" className="code-submit" onClick={submit}>
                <Ic name="send" size={12} /> Submit Solusi
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}