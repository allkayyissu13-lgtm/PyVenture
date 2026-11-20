import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../lib/api";
import { UserIcon, MailIcon, KeyIcon, EyeIcon, EyeOffIcon, GithubIcon, GoogleIcon } from "../components/Icons.jsx";
import logoImg from "../assets/pyventure.png";
import "./authpage.css";


/* ---------- Halaman Auth (login & register) ---------- */
export default function AuthPage({ mode = "login" }) {
  const isLogin = mode === "login";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email, password }, remember);
        navigate("/dashboard");
      } else {
        await register({ username, email, password });
        navigate("/verify", { state: { email } });
      }
    } catch (err) {
      if (err.status === 403) {
        // sandi benar, tapi email belum diverifikasi
        navigate("/verify", { state: { email, remember, fromLogin: true } });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const noop = (e) => e.preventDefault(); // placeholder untuk tautan yang belum punya halaman

  return (
    <div className="auth-page">
      <div className="auth-shell">
        {/* ---------- Panel kiri ---------- */}
        <aside className="auth-aside">
          <div className="auth-aside-top">
            <Link to="/" className="auth-brand" aria-label="Kembali ke beranda">
              <img className="auth-brand-logo" src={logoImg} alt="" />
              <span className="auth-brand-text">
                <span className="auth-brand-name">PyVenture</span>
                <span className="auth-brand-sub">Expedition Gateway</span>
              </span>
            </Link>

            <h1 className="auth-title">
              {isLogin ? "Masuk" : "Daftar"} ke Dunia
              <br />
              PyVenture
            </h1>
            <p className="auth-desc">
              Kuasai sintaksis Python lewat penjelajahan dungeon logika dan
              taklukkan algoritma es.
            </p>
          </div>

          <blockquote className="auth-quote">
            “Setiap baris kode adalah jejak langkah menembus badai es
            ketidaktahuan.”
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
                  minLength={isLogin ? undefined : 8}
                  maxLength={72}
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

            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Memproses…" : `${isLogin ? "Masuk" : "Daftar"} Petualangan →`}
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