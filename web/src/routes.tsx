import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/app-layout";
import DashboardPage from "./pages/dashboard";
import ActionsPage from "./pages/actions";
import OverlaysPage from "./pages/overlays";
import OverlayPage from "./pages/overlay";
import TestPanelPage from "./pages/test-panel";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="actions" element={<ActionsPage />} />
        <Route path="overlays" element={<OverlaysPage />} />
        <Route path="test-panel" element={<TestPanelPage />} />
      </Route>
      <Route path="/overlay/:userId/:game" element={<OverlayPage />} />
    </Routes>
  );
}
