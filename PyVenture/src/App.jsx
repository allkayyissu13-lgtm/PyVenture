import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing.jsx";
import AuthPage from "./pages/authpage.jsx";
import VerifyPage from "./pages/verifypage.jsx";
import DashboardPage from "./pages/dashboardpage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage key="login" mode="login" />} />
      <Route path="/register" element={<AuthPage key="register" mode="register" />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}