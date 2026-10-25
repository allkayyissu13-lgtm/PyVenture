import { Link } from "react-router-dom";
import "./Landing.css";

/* ---------- Gunung pixel art (dibuat dari array tinggi kolom) ---------- */
const HEIGHTS = [1,3,4,5,7,8,11,15,20,21,22,23,24,23,22,21,20,21,22,23,24,23,22,21,20,15,11,8,7,5,4,3,1];
const noise = (x, y) => (x * 7 + y * 13 + x * y) % 5;

function Mountain() {
  const cells = [];
  HEIGHTS.forEach((h, x) => {
    for (let y = 0; y < h; y++) {
      const depth = h - y; // 1 = permukaan atas
      const n = noise(x, y);
      let color;
      if (x < 17) color = n < 3 ? "#3f8fa6" : n < 4 ? "#2f6f86" : "#255a70";
      else if (x < 17) color = n < 3 ? "#2a5d73" : n < 4 ? "#146f8b" : "#1f4e63";
      else color = n < 2 ? "#e3a06f" : n < 4 ? "#c8745a" : "#8f4a52";
      if (depth === 1 && x < 17) color = "#5fb0c0";
      cells.push(
        <rect key={`${x}-${y}`} x={x} y={25 - y - 1} width="1.02" height="1.02" fill={color} />
      );
    }
  });
  return (
    <svg
      className="mountain"
      viewBox="0 0 33 25"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}

/* ---------- Tanah rumput pixel art ---------- */
const GRASS = [2,3,2,2,4,3,2,3,3,4,2,2,3,4,3,2,2,3,2,4,3,3,2,2,4,3,2,3,2,2,3,4,2,3,2,3,4,2,2,3];
function Ground() {
  const cols = GRASS.length;
  const rects = [];
  GRASS.forEach((g, x) => {
    for (let y = 0; y < 12; y++) {
      let color;
      if (y < g) color = (x + y) % 3 === 0 ? "#3f9e4c" : "#5cb860";
      else if (y < g + 2) color = (x + y) % 2 === 0 ? "#3a8a3e" : "#2f7a38";
      else color = (x * 3 + y) % 4 === 0 ? "#7a3f35" : (x + y) % 3 === 0 ? "#6a3a30" : "#8a4a3a";
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={color} />);
    }
  });
  return (
    <svg
      className="ground"
      viewBox={`0 0 ${cols} 12`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}

/* ---------- Ikon sederhana ---------- */
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6 19c1.5-3 4-4 6-4s4.5 1 6 4" />
  </svg>
);
const UserPlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21c1-4 4-6 7-6s6 2 7 6" />
    <path d="M19 8v6M16 11h6" />
  </svg>
);
const EnterIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5M15 12H3" />
  </svg>
);

/* ---------- Komponen utama ---------- */
export default function Landing() {
  return (
    <div className="page">
      <header className="navbar">
        <div className="brand">
          <span className="brand-title">PYVENTURE</span>
          <span className="brand-sub">
            Gamified Python
            <br />
            Learning Platform
          </span>
        </div>
        <nav className="nav-actions">
          <Link to="/login" className="btn btn-outline">
            <UserIcon /> Login
          </Link>
          <Link to="/register" className="btn btn-solid">
            <UserPlusIcon /> Register
          </Link>
        </nav>
      </header>

      <main className="hero">
        <div className="hero-text">
          <h1 className="logo">PYVENTURE</h1>
          <p className="logo-sub">Gamified Python Learning Platform</p>
          <h2 className="headline">
            Code your way to the <span className="accent">next level</span>
          </h2>
          <p className="lead">
            Learn Python, complete exciting quest and unblock new challenges in
            your coding&nbsp;&nbsp;journey
          </p>
          <Link to="/register" className="btn btn-start">
            Get Started <EnterIcon />
          </Link>
        </div>
        <Mountain />
      </main>

      <Ground />
    </div>
  );
}