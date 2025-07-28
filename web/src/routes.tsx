import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/app-layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LandingPage from "./pages/landing";
import LoginPage from "./pages/login";
import AuthCallbackPage from "./pages/auth-callback";
import DashboardPage from "./pages/dashboard";
import ActionsPage from "./pages/actions";
import OverlaysPage from "./pages/overlays";
import OverlayPage from "./pages/overlay";
import TestPanelPage from "./pages/test-panel";
import ItemPrice from "./pages/item-price";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="actions" element={<ActionsPage />} />
        <Route path="overlays" element={<OverlaysPage />} />
        <Route path="test-panel" element={<TestPanelPage />} />
        <Route path="item-price" element={<ItemPrice />} />
      </Route>
      <Route path="/overlay/:userId/:overlayId" element={<OverlayPage />} />
    </Routes>
  );
}
