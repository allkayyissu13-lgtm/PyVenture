import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./authpage.css";

/* ---------- Ikon ---------- */
const Svg = ({ children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </Svg>
);
const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
);
const KeyIcon = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M16 7l3 3M14 9l2 2" />
  </Svg>
);
const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
const EyeOffIcon = (p) => (
  <Svg {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A17 17 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 4.2-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
);
const GemIcon = (p) => (
  <Svg {...p}>
    <path d="M6 3h12l4 6-10 12L2 9z" />
    <path d="M2 9h20M9 3l3 6 3-6M12 21L9 9M12 21l3-12" />
  </Svg>
);
const TerminalIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 10l3 2-3 2M13 15h4" />
  </Svg>
);
const TrophyIcon = (p) => (
  <Svg {...p}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
  </Svg>
);
const GithubIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.3 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
  </svg>
);
const GoogleIcon = (p) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4.01-3.1z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
  </svg>
);

/* ---------- Halaman Auth (login & register) ---------- */
export default function AuthPage({ mode = "login" }) {
  const isLogin = mode === "login";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // TODO: ganti dengan logika login (API) kamu
      console.log({ email, password, remember });
      navigate("/"); // sementara: kembali ke Landing
    } else {
      // TODO: ganti dengan logika register (API) kamu
      console.log({ username, email, password });
      navigate("/login"); // setelah daftar, arahkan ke login
    }
  };

  const noop = (e) => e.preventDefault(); // placeholder untuk tautan yang belum punya halaman

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {/* ---------- Panel kiri ---------- */}
        <aside className="auth-aside">
          <Link to="/" className="auth-brand" aria-label="Kembali ke beranda">
            <span className="auth-brand-name">PyVenture</span>
            <span className="auth-brand-sub">
              Expedition
              <br />
              Gateway
            </span>
          </Link>

          <span className="auth-season">
            <i className="auth-season-dot" /> Season 04: Frostfang Peak
          </span>

          <h1 className="auth-title">
            {isLogin ? "Masuk" : "Daftar"} ke Dunia
            <br />
            PyVenture
          </h1>
          <p className="auth-desc">
            Kuasai sintaksis Python lewat penjelajahan dungeon logika dan
            taklukkan algoritma es.
          </p>

          <section className="auth-bonus" aria-label="Bonus rekrut baru">
            <div className="auth-bonus-head">
              <span className="auth-mono-label">Bonus Rekrut Baru</span>
              <span className="auth-xp">+100 XP</span>
            </div>
            <div className="auth-bonus-item">
              <span className="auth-bonus-icon">
                <GemIcon width="18" height="18" />
              </span>
              <div>
                <strong>Lencana Frost Seeker</strong>
                <p>Otomatis tersemat di profil petualang</p>
              </div>
            </div>
            <div className="auth-features">
              <span>
                <TerminalIcon width="12" height="12" /> Live Cloud IDE
              </span>
              <span>
                <TrophyIcon width="12" height="12" /> Ranked Battles
              </span>
            </div>
          </section>

          <blockquote className="auth-quote">
            "Setiap baris kode adalah jejak langkah menembus badai es
            ketidaktahuan."
          </blockquote>
        </aside>

        {/* ---------- Panel kanan ---------- */}
        <main className="auth-main">
          <nav className="auth-tabs" aria-label="Pilih mode">
            <Link
              to="/login"
              className={`auth-tab${isLogin ? " is-active" : ""}`}
              aria-current={isLogin ? "page" : undefined}
            >
              Masuk (Login)
            </Link>
            <Link
              to="/register"
              className={`auth-tab${!isLogin ? " is-active" : ""}`}
              aria-current={!isLogin ? "page" : undefined}
            >
              Daftar (Register)
            </Link>
          </nav>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="auth-username" className="auth-label">
                  Nama Pengguna Petualang
                </label>
                <div className="auth-input-wrap">
                  <UserIcon className="auth-input-icon" width="16" height="16" />
                  <input
                    id="auth-username"
                    type="text"
                    className="auth-input"
                    placeholder="player_one"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email" className="auth-label">
                Identitas Petualang
              </label>
              <div className="auth-input-wrap">
                <MailIcon className="auth-input-icon" width="16" height="16" />
                <input
                  id="auth-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password" className="auth-label">
                  Sandi Akses Portal
                </label>
                <button type="button" className="auth-link-btn" onClick={noop}>
                  Lupa Sandi?
                </button>
              </div>
              <div className="auth-input-wrap">
                <KeyIcon className="auth-input-icon" width="16" height="16" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={isLogin ? undefined : 6}
                  required
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOffIcon width="16" height="16" />
                  ) : (
                    <EyeIcon width="16" height="16" />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-row">
              <label className="auth-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ingat koordinat saya
              </label>
              {isLogin && <span className="auth-vault">Vault: Terenkripsi</span>}
            </div>

            <button type="submit" className="auth-submit">
              {isLogin ? "Masuk Petualangan" : "Daftar Petualangan"} →
            </button>
          </form>

          <div className="auth-bottom">
            <div className="auth-divider">
              <span>Akses Cepat Guild</span>
            </div>
            <div className="auth-social">
              <button type="button" className="auth-social-btn" onClick={noop}>
                <GithubIcon width="14" height="14" /> GitHub
              </button>
              <button type="button" className="auth-social-btn" onClick={noop}>
                <GoogleIcon width="14" height="14" /> Google
              </button>
            </div>
            <p className="auth-legal">
              Dengan melanjutkan, Anda menyetujui{" "}
              <a href="#" onClick={noop}>Perjanjian Ekspedisi</a> &amp;{" "}
              <a href="#" onClick={noop}>Protokol Privasi</a>.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}