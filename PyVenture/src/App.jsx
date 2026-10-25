import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing.jsx";
import LoginPage from "./pages/loginpage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}