import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* ---------- Lazy-loaded pages (code-splitting) ---------- */
const Landing = lazy(() => import("./Landing.jsx"));
const AuthPage = lazy(() => import("./pages/authpage.jsx"));
const VerifyPage = lazy(() => import("./pages/verifypage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboardpage.jsx"));
const LearningPage = lazy(() => import("./pages/learningpage.jsx"));
const ModulePage = lazy(() => import("./pages/modulepage.jsx"));
const CodePage = lazy(() => import("./pages/codepage.jsx"));
const ResultPage = lazy(() => import("./pages/resultpage.jsx"));
const CompetitionPage = lazy(() => import("./pages/competitionpage.jsx"));

/* Loading fallback — ringan, tampil saat chunk sedang di-download */
function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#aab5de" }}>
      Memuat halaman…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthPage key="login" mode="login" />} />
        <Route path="/register" element={<AuthPage key="register" mode="register" />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/modul" element={<LearningPage />} />
        <Route path="/modul/:id" element={<ModulePage />} />
        <Route path="/kompetisi" element={<CompetitionPage />} />
        <Route path="/quest" element={<CodePage />} />
        <Route path="/quest/success" element={<ResultPage mode="success" />} />
        <Route path="/quest/failed" element={<ResultPage mode="failed" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
