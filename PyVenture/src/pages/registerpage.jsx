import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./registerpage.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: ganti dengan logika register (API) kamu
    console.log({ username, email, password });
    navigate("/login"); // setelah daftar, arahkan ke halaman login
  };

  return (
    <div className="register-page">
      {/* Logo (klik untuk kembali ke Landing) */}
      <Link to="/" className="reg-logo-link" aria-label="Kembali ke beranda">
        <header className="reg-logo">
          <h1 className="reg-logo-title">
            <span className="reg-logo-py">PY</span>
            <span className="reg-logo-venture">VENTURE</span>
          </h1>
          <p className="reg-logo-subtitle">GAMIFIED PYTHON LEARNING PLATFORM</p>
        </header>
      </Link>

      {/* Kartu register */}
      <main className="register-card">
        <div className="register-badge">
          <svg className="register-badge-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="8" r="4" fill="#fff" />
            <path d="M1.5 21c.9-4 3.8-6 7.5-6s6.6 2 7.5 6z" fill="#fff" />
            <path d="M19 7v7M15.5 10.5h7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span>Register</span>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="username" className="register-label">Username</label>
          <input
            id="username"
            type="text"
            className="register-input"
            placeholder="player_one"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="email" className="register-label">Email</label>
          <input
            id="email"
            type="email"
            className="register-input"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password" className="register-label">Password</label>
          <input
            id="password"
            type="password"
            className="register-input"
            placeholder="**********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <button type="submit" className="register-button">MULAI PERJALANAN</button>
        </form>

        <p className="register-switch">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </main>
    </div>
  );
}