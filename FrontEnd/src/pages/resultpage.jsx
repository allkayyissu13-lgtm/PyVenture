import { Link, useLocation } from "react-router-dom";
import "./resultpage.css";

const DEFAULT_RESULTS = [
  { name: "Test Case 1", ok: false },
  { name: "Test Case 2", ok: false },
  { name: "Test Case 3", ok: true },
];

const TrophyIcon = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3h10v6a5 5 0 0 1-10 0z" fill="currentColor" />
    <path
      d="M7 5H4v1a4 4 0 0 0 4 4M17 5h3v1a4 4 0 0 1-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M12 14v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect x="8" y="18" width="8" height="2.5" rx="1" fill="currentColor" />
  </svg>
);

const BoltIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1d273d" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </svg>
);

const MedalIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 2h10l-3 7h-4z" fill="#1d273d" />
    <circle cx="12" cy="15" r="6" fill="#1d273d" />
    <path d="M12 11.800l1 2 2.200.3-1.600 1.500.4 2.200-2-1.100-2 1.100.4-2.200-1.600-1.500 2.200-.3z" fill="#aab5de" />
  </svg>
);

/* mode: "success" | "failed" */
export default function ResultPage({ mode }) {
  const { state } = useLocation();
  const isSuccess = mode === "success";

  const points = state?.points ?? 50;
  const badge = state?.badge ?? "Badge name";
  const results = state?.results ?? DEFAULT_RESULTS;

  return (
    <div className="result-page">
      <main className="result-stage">
        <div className="result-card">
          <div className="result-trophy">
            <TrophyIcon />
          </div>

          {isSuccess ? (
            <>
              <h1 className="result-title">Selamat!</h1>
              <p className="result-sub">Kamu berhasil menyelesaikan soal ini.</p>

              <div className="result-rewards">
                <div className="result-reward">
                  <BoltIcon />
                  <strong>+{points}</strong>
                  <span>Point</span>
                </div>
                <div className="result-reward">
                  <MedalIcon />
                  <strong>Badge</strong>
                  <span>{badge}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="result-title">Ups! Jawaban kamu belum tepat.</h1>
              <p className="result-sub">Coba periksa kembali kode kamu atau lihat petunjuk di bawah.</p>

              <table className="result-table">
                <thead>
                  <tr>
                    <th colSpan="2" scope="colgroup">Hasil Test Case</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.name}>
                      <th scope="row">{r.name}</th>
                      <td>{r.ok ? "Semua Sesuai" : "Output Tidak Sesuai"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {isSuccess ? (
          <div className="result-actions">
            <Link to="/quest" className="result-btn">Lanjut ke Soal Berikutnya</Link>
            <Link to="/modul" className="result-btn">Kembali ke Modul</Link>
          </div>
        ) : (
          <div className="result-actions is-row">
            <Link to="/quest" className="result-btn is-half">Coba Lagi</Link>
            {/* TODO: arahkan ke halaman pembahasan saat sudah dibuat */}
            <button type="button" className="result-btn is-half">Lihat Pembahasan</button>
          </div>
        )}
      </main>
    </div>
  );
}