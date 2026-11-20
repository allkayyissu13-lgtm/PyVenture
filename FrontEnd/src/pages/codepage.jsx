import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { Icon } from "../components/Icons.jsx";
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
      <Navbar active="quest" />

      <div className="code-shell">
        {/* ---------- Header level ---------- */}
        <div className="code-top">
          <div className="code-heading">
            <Link to="/modul" className="code-back">
              <Icon name="back" size={12} /> Kembali ke Modul
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
                <Icon name={l.state === "done" ? "check" : l.state === "active" ? "star" : "lock"} size={11} solid={l.state === "active"} />
                {l.id}: {l.label}
              </li>
            ))}
          </ol>

          <div className="code-meta">
            <span className="code-timer" aria-label="Waktu pengerjaan">
              <Icon name="clock" size={13} /> {formatTime(elapsed)}
            </span>
            <button type="button" className="code-hint-btn" onClick={revealHint} disabled={hintsUsed >= HINTS.length}>
              <Icon name="bulb" size={13} /> Hint Clue ({hintsUsed}/{HINTS.length})
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
                <Icon name="list" size={13} /> Instruksi Soal
              </span>
            </div>

            <div className="code-brief-body">
              <div className="code-topic">
                <span className="code-topic-icon">
                  <Icon name="bolt" size={16} solid />
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
                  <Icon name="input" size={12} /> Format Masukan (Input)
                </h2>
                <pre className="code-io-box">{CHALLENGE.input}</pre>
              </div>
              <div>
                <h2 className="code-io-title is-out">
                  <Icon name="output" size={12} /> Format Keluaran (Output)
                </h2>
                <pre className="code-io-box">{CHALLENGE.output}</pre>
              </div>
            </div>
          </section>

          {/* ---------- Panel editor ---------- */}
          <section className="code-ide" aria-label="Editor kode">
            <div className="code-ide-bar">
              <span className="code-file">
                <Icon name="file" size={12} /> solution.py <i aria-label="belum disimpan ke server" />
              </span>
              <span className="code-ver">
                <span>
                  <Icon name="terminal" size={12} /> Python 3.14
                </span>
                <button
                  type="button"
                  className="code-icon-btn"
                  onClick={() => setCode("")}
                  aria-label="Kosongkan editor"
                  title="Kosongkan editor"
                >
                  <Icon name="refresh" size={12} />
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
                  <Icon name="terminal" size={12} /> Terminal
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
                {running ? "Menjalankan..." : "Jalankan Kode"} <Icon name="play" size={10} solid />
              </button>
              <button type="button" className="code-submit" onClick={submit}>
                <Icon name="send" size={12} /> Submit Solusi
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
