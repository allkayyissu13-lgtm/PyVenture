import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing.jsx";
import AuthPage from "./pages/authpage.jsx";
import VerifyPage from "./pages/verifypage.jsx";
import DashboardPage from "./pages/dashboardpage.jsx";
import LearningPage from "./pages/learningpage.jsx";
import ModulePage from "./pages/modulepage.jsx";
import CodePage from "./pages/codepage.jsx";
import ResultPage from "./pages/resultpage.jsx";
import CompetitionPage from "./pages/competitionpage.jsx";
import CompetitionWorkspace from "./pages/competitionworkspace.jsx";
import { MODULES } from "./data/modules.js";
import { getSolvedIds, isUnlocked } from "./lib/progress.js";

/* /quest -> langsung ke soal pertama yang belum selesai */
function QuestIndex() {
  for (let i = 0; i < MODULES.length; i++) {
    if (!isUnlocked(MODULES, i)) break;
    const solved = getSolvedIds(MODULES[i].id);
    const next = MODULES[i].quiz.find((q) => !solved.includes(q.id));
    if (next) return <Navigate to={"/quest/" + MODULES[i].id + "/" + next.id} replace />;
  }
  return <Navigate to="/modul" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage key="login" mode="login" />} />
      <Route path="/register" element={<AuthPage key="register" mode="register" />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/modul" element={<LearningPage />} />
      <Route path="/modul/:id" element={<ModulePage />} />
      <Route path="/kompetisi" element={<CompetitionPage />} />
      <Route path="/kompetisi/:id" element={<CompetitionWorkspace />} />
      <Route path="/quest" element={<QuestIndex />} />
      <Route path="/quest/success" element={<ResultPage mode="success" />} />
      <Route path="/quest/failed" element={<ResultPage mode="failed" />} />
      <Route path="/quest/:moduleId/:questId" element={<CodePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}