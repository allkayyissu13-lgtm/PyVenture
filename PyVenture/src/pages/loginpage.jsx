import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./loginpage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: ganti dengan logika login (API) kamu
    console.log({ email, password });
    navigate("/"); // setelah login, arahkan ke halaman tujuan (sementara: Landing)
  };

  return (
    <div className="login-page">
      {/* Logo (klik untuk kembali ke Landing) */}
      <Link to="/" className="logo-link" aria-label="Kembali ke beranda">
        <header className="login-logo">
          <h1 className="logo-title">
            <span className="logo-py">PY</span>
            <span className="logo-venture">VENTURE</span>
          </h1>
          <p className="logo-subtitle">GAMIFIED PYTHON LEARNING PLATFORM</p>
        </header>
      </Link>

      {/* Kartu login */}
      <main className="login-card">
        <div className="login-badge">
          <svg className="login-badge-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="#fff" />
            <circle cx="12" cy="9.5" r="3.6" fill="#1d3461" />
            <path
              d="M4.8 19.2c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5c-1.9 2.3-4.4 3.6-7.2 3.6s-5.3-1.3-7.2-3.6z"
              fill="#1d3461"
            />
          </svg>
          <span>Login</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email" className="login-label">Email</label>
          <input
            id="email"
            type="email"
            className="login-input"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label htmlFor="password" className="login-label">Password</label>
          <input
            id="password"
            type="password"
            className="login-input"
            placeholder="**********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button type="submit" className="login-button">MASUK</button>
        </form>
      </main>
    </div>
  );
}
