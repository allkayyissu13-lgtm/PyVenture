import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./verifypage.css";

const LENGTH = 6;
const COOLDOWN = 59; // detik

const MailCheckIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="verify-icon-svg">
    <rect x="6" y="12" width="44" height="32" rx="6" fill="#0e1626" />
    <path
      d="M9 17l19 14 19-14"
      fill="none"
      stroke="#e3e3e3"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="47" cy="44" r="10" fill="#0e1626" stroke="#e3e3e3" strokeWidth="2.5" />
    <path
      d="M42.5 44.5l3 3 5.5-6"
      fill="none"
      stroke="#e3e3e3"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function VerifyPage() {
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [seconds, setSeconds] = useState(COOLDOWN);
  const [error, setError] = useState("");
  const inputs = useRef([]);
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email; // dikirim dari halaman register

  // Fokus ke kotak pertama saat halaman dibuka
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // Hitung mundur kirim ulang kode
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Isi kotak mulai dari index tertentu (dipakai untuk ketik, paste, dan autofill)
  const fill = (start, text) => {
    const next = [...digits];
    text
      .slice(0, LENGTH - start)
      .split("")
      .forEach((ch, k) => {
        next[start + k] = ch;
      });
    setDigits(next);
    inputs.current[Math.min(start + text.length, LENGTH - 1)]?.focus();
  };

  const handleChange = (i, e) => {
    setError("");
    let value = e.target.value.replace(/\D/g, "");
    if (!value) {
      const next = [...digits];
      next[i] = "";
      setDigits(next);
      return;
    }
    // Kotak sudah berisi lalu diketik lagi: ambil angka barunya saja
    if (value.length > 1 && digits[i]) {
      value = value.replace(digits[i], "").slice(0, 1) || digits[i];
    }
    fill(i, value);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < LENGTH - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (text) {
      setError("");
      fill(0, text);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < LENGTH) {
      setError("Masukkan 6 digit kode verifikasi.");
      inputs.current[digits.findIndex((d) => !d)]?.focus();
      return;
    }
    // TODO: ganti dengan verifikasi kode (API) kamu
    console.log({ email, code });
    navigate("/login"); // setelah terverifikasi, arahkan ke login
  };

  const handleResend = () => {
    // TODO: ganti dengan kirim ulang kode (API) kamu
    setDigits(Array(LENGTH).fill(""));
    setError("");
    setSeconds(COOLDOWN);
    inputs.current[0]?.focus();
  };

  const timer = `00:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="verify-page">
      <main className="verify-card">
        <Link to="/" className="verify-brand" aria-label="Kembali ke beranda">
          <span className="verify-brand-name">PyVenture</span>
          <span className="verify-brand-sub">Expedition Gateway</span>
        </Link>

        <div className="verify-icon">
          <MailCheckIcon />
        </div>

        <h1 className="verify-title">Verifikasi Email Kamu</h1>
        <p className="verify-desc">
          Kami telah mengirimkan kode verifikasi ke email kamu.
          <br />
          Silakan masukkan kode di bawah ini.
        </p>

        <form className="verify-form" onSubmit={handleSubmit} noValidate>
          <div className="verify-code" role="group" aria-label="Kode verifikasi 6 digit">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                className="verify-box"
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${i + 1}`}
                aria-invalid={error ? "true" : undefined}
                value={d}
                onChange={(e) => handleChange(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          {error && (
            <p className="verify-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="verify-submit">
            Verifikasi
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        {seconds > 0 ? (
          <p className="verify-resend">Kirim ulang kode ({timer})</p>
        ) : (
          <button type="button" className="verify-resend verify-resend-btn" onClick={handleResend}>
            Kirim ulang kode
          </button>
        )}
      </main>
    </div>
  );
}