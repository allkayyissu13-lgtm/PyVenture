import { Link } from "react-router-dom";
import logoImg from "./assets/pyventure.png";
import mountainImg from "./assets/mountain.png";
import "./Landing.css";

/* ---------- Tanah rumput pixel art ---------- */
const COLS = 48;
const ROWS = 12;

// angka acak yang selalu sama di setiap render (bukan Math.random)
const rnd = (x, y) => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

// jumlah baris kosong di atas tiap kolom (per 2 kolom) -> tepi rumput bergerigi
// semua kolom mulai dari baris yang sama -> tepi rumput rata
const TOPS = Array(COLS).fill(0);

const GREENS = ["#6cc971", "#5fbd64", "#52b058"];
const DEEP_GREENS = ["#4a9f50", "#3f9247"];
const DIRT = ["#6e432b", "#7d4d32", "#5d3823", "#8c5a3a"];
const DARK_DIRT = ["#4e2f1d", "#5d3823"];

function Ground() {
  const rects = [];
  TOPS.forEach((top, x) => {
    for (let y = top; y < ROWS; y++) {
      const d = y - top; // 0 = permukaan rumput
      const r = rnd(x, y + 1);
      let color;
      if (d < 3) color = GREENS[Math.floor(r * GREENS.length)];
      else if (d < 5) color = DEEP_GREENS[Math.floor(r * DEEP_GREENS.length)];
      else if (y >= ROWS - 2) color = r < 0.5 ? DARK_DIRT[0] : DARK_DIRT[1];
      else color = DIRT[Math.floor(r * DIRT.length)];
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={color} />);
    }
  });
  return (
    <svg
      className="ground"
      viewBox={`0 0 ${COLS} ${ROWS}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}

/* ---------- Komponen utama ---------- */
export default function Landing() {
  return (
    <div className="page">
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <img className="brand-logo" src={logoImg} alt="" />
            <div className="brand-text">
              <span className="brand-title">
                <span className="brand-py">PY</span>
                <span className="brand-venture">VENTURE</span>
              </span>
              <span className="brand-sub">
                Gamified Python
                <br />
                Learning Platform
              </span>
            </div>
          </div>

          <nav className="nav-actions" aria-label="Akun">
            <Link to="/login" className="btn">Masuk (Login)</Link>
            <Link to="/register" className="btn">Daftar (Register)</Link>
          </nav>
        </div>
      </header>

      <main className="hero">
        <div className="hero-text">
          <h1 className="logo">
            <span className="logo-py">PY</span>
            <span className="logo-venture">VENTURE</span>
          </h1>
          <p className="logo-sub">Gamified Python Learning Platform</p>
          <h2 className="headline">
            Code your way to
            <br />
            the <span className="accent">next level</span>
          </h2>
          <p className="lead">
            Learn Python, complete exciting quests and unlock new challenges in
            your coding journey.
          </p>
        </div>

        <img className="mountain" src={mountainImg} alt="" aria-hidden="true" />
      </main>

      <Ground />
    </div>
  );
}