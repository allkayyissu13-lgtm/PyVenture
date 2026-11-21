import { useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import LiveStandings from "../components/LiveStandings.jsx";
import {
  formatRupiah,
  getCompetition,
  getSolvedProblems,
  markProblemSolved,
  rankOf,
} from "../data/competitions.js";
import { judgeAll, runPython, warmUp } from "../lib/judge.js";
import { formatRemaining, useNow } from "../lib/useNow.js";
import "./competitionworkspace.css";

/* Abaikan spasi di akhir baris dan baris kosong di akhir (sama seperti judge.js) */
const norm = (s) =>
  String(s ?? "")
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();

const oneLine = (s) => String(s ?? "").trim().split("\n").join(" ⏎ ");

const STATUS = { ok: "SUKSES", wrong: "GAGAL", error: "ERROR", timeout: "WAKTU HABIS" };
const STATUS_LONG = { wrong: "output tidak sesuai", error: "terjadi error", timeout: "waktu habis" };

const loadDraft = (key, fallback) => {
  try {
    return sessionStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

/* ---------- Ikon ---------- */
const PATHS = {
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
  lines: <path d="M4 6h16M4 12h16M4 18h16" />,
  refresh: <path d="M20 11a8 8 0 1 0-2 6M20 5v6h-6" />,
  contrast: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>,
  play: <path d="M7 4l13 8-13 8z" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  check: <path d="M5 12l5 5 9-10" />,
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

/* ---------- Satu sample (dengan tombol Salin) ---------- */
function Sample({ n, sample }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sample.input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* abaikan */
    }
  };

  return (
    <section className="cw-sample" aria-label={"Sample " + n}>
      <div className="cw-sample-head">
        <span className="cw-label">Sample {n}</span>
        <button type="button" className="cw-copy" onClick={copy} aria-label={"Salin input sample " + n}>
          <Ic name="copy" size={11} /> {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <span className="cw-io-label">Input:</span>
      <pre className="cw-io">{sample.input.trimEnd()}</pre>
      <span className="cw-io-label">Output:</span>
      <pre className="cw-io">{sample.output}</pre>
    </section>
  );
}

/* ---------- Editor + penilaian satu soal ---------- */
function Solver({ comp, problem, ended, solved, onSolved }) {
  const draftKey = "pyventure-comp-draft-" + comp.id + "-" + problem.id;
  const starter = problem.starter ?? "";

  const [code, setCode] = useState(() => loadDraft(draftKey, starter));
  const [sampleRun, setSampleRun] = useState(null);
  const [final, setFinal] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(null); // "run" | "submit" | null
  const [showLines, setShowLines] = useState(true);
  const [light, setLight] = useState(false);

  const gutterRef = useRef(null);
  const escapeTab = useRef(false);

  // Mulai memuat Python di latar belakang
  useEffect(() => {
    warmUp();
  }, []);

  // Simpan kode supaya tidak hilang saat pindah soal
  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey, code);
    } catch {
      /* abaikan */
    }
  }, [code, draftKey]);

  const lineCount = Math.max(14, code.split("\n").length);

  /* Jalankan kode terhadap sample */
  const runSamples = async () => {
    if (busy) return;
    if (!code.trim()) {
      setNotice("Editor masih kosong. Tulis kode dulu.");
      return;
    }
    setNotice("");
    setFinal(null);
    setBusy("run");

    const t0 = performance.now();
    const results = [];
    for (const s of problem.samples) {
      const r = await runPython(code, s.input);
      let status = "ok";
      if (r.timeout) status = "timeout";
      else if (r.error) status = "error";
      else if (norm(r.stdout) !== norm(s.output)) status = "wrong";

      let got = r.stdout;
      if (r.timeout) got = "(waktu habis)";
      else if (r.error) got = r.error.trim().split("\n").pop();
      results.push({ status, expected: s.output, got });
    }
    setSampleRun({ results, secs: (performance.now() - t0) / 1000 });
    setBusy(null);
  };

  /* Nilai terhadap sample + test case tersembunyi */
  const submit = async () => {
    if (busy || ended) return;
    if (!code.trim()) {
      setNotice("Editor masih kosong. Tulis kode dulu.");
      return;
    }
    setNotice("");
    setBusy("submit");

    const was = solved.includes(problem.id);
    const results = await judgeAll(code, [...problem.samples, ...problem.testCases]);
    const passed = results.filter((r) => r.ok).length;
    const accepted = passed === results.length;
    const firstFail = results.find((r) => !r.ok);

    setFinal({
      accepted,
      passed,
      total: results.length,
      fresh: !was,
      failType: firstFail ? firstFail.status : null,
    });
    if (accepted) onSolved(problem.id);
    setBusy(null);
  };

  const reset = () => {
    if (code !== starter && !window.confirm("Kembalikan kode awal? Perubahanmu akan hilang.")) return;
    setCode(starter);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runSamples();
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

  const okCount = sampleRun ? sampleRun.results.filter((r) => r.status === "ok").length : 0;
  const isSolved = solved.includes(problem.id);

  return (
    <section className="cw-ide" aria-label="Editor kode">
      <div className="cw-ide-bar">
        <span className="cw-file">
          <span className="cw-lang">
            <Ic name="code" size={12} /> Python 3.12
          </span>
          solution.py
          {isSolved && (
            <span className="cw-solved">
              <Ic name="check" size={10} /> Selesai
            </span>
          )}
        </span>
        <span className="cw-tools">
          <button
            type="button"
            className={"cw-tool" + (showLines ? " is-on" : "")}
            onClick={() => setShowLines((v) => !v)}
            aria-pressed={showLines}
            aria-label="Tampilkan nomor baris"
            title="Nomor baris"
          >
            <Ic name="lines" size={14} />
          </button>
          <button type="button" className="cw-tool" onClick={reset} aria-label="Kembalikan kode awal" title="Kode awal">
            <Ic name="refresh" size={14} />
          </button>
          <button
            type="button"
            className={"cw-tool" + (light ? " is-on" : "")}
            onClick={() => setLight((v) => !v)}
            aria-pressed={light}
            aria-label="Tema editor terang"
            title="Tema editor"
          >
            <Ic name="contrast" size={14} />
          </button>
        </span>
      </div>

      <div className={"cw-editor" + (light ? " is-light" : "")}>
        {showLines && (
          <div className="cw-gutter" ref={gutterRef} aria-hidden="true">
            {Array.from({ length: lineCount }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}
        <textarea
          className="cw-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={(e) => {
            if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
          }}
          placeholder="# Tulis kode Python di sini"
          spellCheck={false}
          wrap="off"
          aria-label="Editor kode solution.py"
        />
      </div>

      <div className="cw-results" aria-live="polite">
        {notice && <p className="cw-notice">{notice}</p>}
        {ended && <p className="cw-notice">Kompetisi sudah berakhir. Jawaban tidak lagi dihitung.</p>}

        {sampleRun ? (
          <>
            <div className="cw-run-head">
              <span className={"cw-chip " + (okCount === sampleRun.results.length ? "is-ok" : "is-bad")}>
                {okCount === sampleRun.results.length ? "✓" : "✗"} Testcase Sample ({okCount}/
                {sampleRun.results.length} Passed)
              </span>
              <span className="cw-time">Waktu: {sampleRun.secs.toFixed(3)}s</span>
            </div>
            {sampleRun.results.map((r, i) => (
              <div className={"cw-case is-" + r.status} key={i}>
                <strong>
                  {r.status === "ok" ? "✓" : "✗"} Sample Case {i + 1}: {STATUS[r.status]}
                </strong>
                <span>
                  Expected: {oneLine(r.expected)} - Your Output: {oneLine(r.got)}
                </span>
              </div>
            ))}
          </>
        ) : (
          !final && !notice && (
            <p className="cw-hint">
              Klik <b>Jalankan Kode</b> untuk menguji sample, atau tekan Ctrl + Enter.
            </p>
          )
        )}

        {final && (
          <div className={"cw-final " + (final.accepted ? "is-ok" : "is-bad")} role="status">
            {final.accepted
              ? "Jawaban diterima! Semua " +
                final.total +
                " test case lolos." +
                (final.fresh ? " +" + problem.points.toLocaleString("en-US") + " pts" : "")
              : "Belum tepat: " +
                final.passed +
                "/" +
                final.total +
                " test case lolos" +
                (final.failType ? " (" + STATUS_LONG[final.failType] + ")" : "") +
                "."}
          </div>
        )}
      </div>

      <div className="cw-actions">
        <button type="button" className="cw-btn-run" onClick={runSamples} disabled={!!busy}>
          <Ic name="play" size={10} fill /> {busy === "run" ? "Menjalankan..." : "Jalankan Kode"}
        </button>
        <button type="button" className="cw-btn-submit" onClick={submit} disabled={!!busy || ended}>
          <Ic name="send" size={12} /> {busy === "submit" ? "Menilai..." : "Submit Jawaban Final"}
        </button>
      </div>
    </section>
  );
}

/* ---------- Ruang pengerjaan ---------- */
function Workspace({ comp }) {
  const now = useNow();
  const time = formatRemaining(comp.endsAt - now);
  const ended = time === null;

  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(() => getSolvedProblems(comp.id));

  const problem = comp.problems[index];
  const solvedCount = comp.problems.filter((p) => solved.includes(p.id)).length;
  const myPts = comp.problems.filter((p) => solved.includes(p.id)).reduce((sum, p) => sum + p.points, 0);

  const me = {
    name: "Kamu (Explorer)",
    initials: "KM",
    // avatar: "/foto-profil.jpg", // opsional: isi untuk menampilkan foto
    pts: myPts,
    rank: rankOf(comp.standings, myPts),
    sub: solvedCount + "/" + comp.problems.length + " Soal Selesai",
  };

  const handleSolved = (problemId) => {
    markProblemSolved(comp.id, problemId);
    setSolved(getSolvedProblems(comp.id));
  };

  return (
    <div className="cw-page">
      <Navbar active="kompetisi" />

      <main className="cw-main">
        {/* ---------- Header ---------- */}
        <header className="cw-head">
          <div>
            <span className={"cw-live" + (ended ? " is-ended" : "")}>
              <i /> {ended ? "Selesai" : "Sedang Berlangsung"}
            </span>
            <h1 className="cw-title">{comp.name}</h1>
            <p className="cw-desc">{comp.desc}</p>
          </div>

          <div className="cw-head-stats">
            <div className="cw-box">
              <span className="cw-label">Sisa Waktu</span>
              <strong className="cw-timer" role="timer">
                <Ic name="clock" size={15} /> {time ?? "00:00:00"}
              </strong>
            </div>
            <div className="cw-box">
              <span className="cw-label">Total Hadiah Pool</span>
              <strong className="cw-prize">{formatRupiah(comp.prizePool)}</strong>
              {comp.rewardNote && <span className="cw-prize-note">{comp.rewardNote}</span>}
            </div>
          </div>
        </header>

        <div className="cw-grid">
          {/* ---------- Aturan & soal ---------- */}
          <aside className="cw-panel cw-left" aria-label="Aturan dan soal">
            <div className="cw-rules">
              <h2>Aturan Kompetisi</h2>
              {comp.rules.length > 0 ? (
                <ul>
                  {comp.rules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              ) : (
                <p>Belum ada aturan.</p>
              )}
            </div>

            {problem ? (
              <>
                <nav className="cw-chips" aria-label="Pilih soal">
                  {comp.problems.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      className={
                        "cw-chip-btn" +
                        (i === index ? " is-active" : "") +
                        (solved.includes(p.id) ? " is-done" : "")
                      }
                      aria-current={i === index ? "true" : undefined}
                      aria-label={"Soal " + (i + 1) + (solved.includes(p.id) ? ", selesai" : "")}
                      onClick={() => setIndex(i)}
                    >
                      {solved.includes(p.id) ? "✓ " : ""}S{i + 1}
                    </button>
                  ))}
                </nav>

                <section className="cw-problem" aria-label="Soal kompetisi">
                  <span className="cw-label">Soal Kompetisi</span>
                  <div className="cw-statement">
                    <strong>
                      {index + 1}. {problem.title}
                    </strong>
                    <p>{problem.description}</p>
                    {problem.inputFormat && (
                      <p>
                        <b>Masukan:</b> {problem.inputFormat}
                      </p>
                    )}
                    {problem.outputFormat && (
                      <p>
                        <b>Keluaran:</b> {problem.outputFormat}
                      </p>
                    )}
                  </div>
                </section>

                {problem.samples.map((s, i) => (
                  <Sample key={problem.id + "-" + i} n={i + 1} sample={s} />
                ))}
              </>
            ) : (
              <p className="cw-empty">Soal belum ditambahkan untuk kompetisi ini.</p>
            )}
          </aside>

          {/* ---------- Editor ---------- */}
          {problem ? (
            <Solver
              key={comp.id + "-" + problem.id}
              comp={comp}
              problem={problem}
              ended={ended}
              solved={solved}
              onSolved={handleSolved}
            />
          ) : (
            <section className="cw-ide cw-ide-empty" aria-label="Editor kode">
              <p>Editor akan aktif setelah soal ditambahkan.</p>
            </section>
          )}

          {/* ---------- Peringkat ---------- */}
          <LiveStandings entries={comp.standings} me={me} />
        </div>
      </main>

      <footer className="cw-footer">
        © 2026 PyVenture Expedition Corp. All rights reserved. Built for deep-flow learning.
      </footer>
    </div>
  );
}

/* ---------- Pembungkus: ambil kompetisi dari URL ---------- */
export default function CompetitionWorkspace() {
  const { id } = useParams();
  const comp = getCompetition(id);
  if (!comp) return <Navigate to="/kompetisi" replace />;
  return <Workspace key={comp.id} comp={comp} />;
}