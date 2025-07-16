import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/dashboard";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/actions" element={<h1>actions</h1>} />
    </Routes>
  );
}