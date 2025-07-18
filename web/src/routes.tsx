import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/dashboard";
import ActionsPage from "./pages/actions";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/actions" element={<ActionsPage />} />
    </Routes>
  );
}