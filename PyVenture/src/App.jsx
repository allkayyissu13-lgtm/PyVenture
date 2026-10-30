import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing.jsx";
import AuthPage from "./pages/authpage.jsx";
import VerifyPage from "./pages/verifypage.jsx";
import DashboardPage from "./pages/dashboardpage.jsx";
import LearningPage from "./pages/learningpage.jsx";
import CodePage from "./pages/codepage.jsx";
import ResultPage from "./pages/resultpage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage key="login" mode="login" />} />
      <Route path="/register" element={<AuthPage key="register" mode="register" />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/modul" element={<LearningPage />} />
      <Route path="/quest" element={<CodePage />} />
      <Route path="/quest/success" element={<ResultPage mode="success" />} />
      <Route path="/quest/failed" element={<ResultPage mode="failed" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}