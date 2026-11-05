/**
 * frontend/src/App.jsx
 * Router aplikasi utama, konfigurasi route guard per role, dan context provider.
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerStoreProvider } from "./context/PlayerStoreContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";

// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Manager Pages
import { ManagerDashboard } from "./pages/manager/ManagerDashboard";
import { LeaderboardPage } from "./pages/manager/LeaderboardPage";
import { ComparePage } from "./pages/manager/ComparePage";
import { ShortlistPage } from "./pages/manager/ShortlistPage";
import { ManagerTeamProfilePage } from "./pages/manager/ManagerTeamProfilePage";

// Player Pages
import { PlayerProfilePage } from "./pages/player/PlayerProfilePage";
import { PlayerInputPage } from "./pages/player/PlayerInputPage";
import { PlayerHistoryPage } from "./pages/player/PlayerHistoryPage";
import { PlayerDashboard } from "./pages/player/PlayerDashboard";

// Common Pages
import { TeamDirectoryPage } from "./pages/common/TeamDirectoryPage";
import { AboutModelPage } from "./pages/common/AboutModelPage";
import { EsportsHubPage } from "./pages/common/EsportsHubPage";
import { LandingPage } from "./pages/common/LandingPage";
import { NotFound } from "./pages/common/NotFound";

import { ErrorBoundary } from "./components/common/ErrorBoundary";

/**
 * Root Redirector: Mengarahkan pengguna ke home page yang sesuai dengan peran (role)
 */
const RootRedirector = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(role || user?.user_metadata?.role || "player").toLowerCase().trim();
  if (userRole === "manager") {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/player/dashboard" replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PlayerStoreProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* App Layout Routes */}
                <Route path="/" element={<MainLayout />}>
                  {/* Index Route */}
                  <Route index element={<RootRedirector />} />

                  {/* Public Information Route */}
                  <Route path="about-model" element={<AboutModelPage />} />
                  <Route path="esports" element={<EsportsHubPage />} />
                  <Route path="showcase" element={<LandingPage />} />
                  <Route path="landing" element={<LandingPage />} />

            {/* Manager Protected Routes */}
            <Route
              path="manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="manager/leaderboard"
              element={
                <ProtectedRoute allowedRoles={["manager", "player", "talent"]}>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="manager/compare"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ComparePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="manager/shortlists"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ShortlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="manager/team-profile"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ManagerTeamProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Common Team Directory / Hub (Accessible by Manager & Player) */}
            <Route
              path="teams"
              element={
                <ProtectedRoute allowedRoles={["manager", "player", "talent"]}>
                  <TeamDirectoryPage />
                </ProtectedRoute>
              }
            />

            {/* Player Protected Routes (Strictly for Player/Talent only) */}
            <Route
              path="player/dashboard"
              element={
                <ProtectedRoute allowedRoles={["player", "talent"]}>
                  <PlayerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="player/profile"
              element={
                <ProtectedRoute allowedRoles={["player", "talent"]}>
                  <PlayerProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="player/input"
              element={
                <ProtectedRoute allowedRoles={["player", "talent"]}>
                  <PlayerInputPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="player/history"
              element={
                <ProtectedRoute allowedRoles={["player", "talent"]}>
                  <PlayerHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Friendly URL Aliases (Prevent 404 on common user URLs) */}
            <Route path="profile" element={<Navigate to="/player/profile" replace />} />
            <Route path="player-profile" element={<Navigate to="/player/profile" replace />} />
            <Route path="playerprofile" element={<Navigate to="/player/profile" replace />} />
            <Route path="player" element={<Navigate to="/player/profile" replace />} />
            <Route path="input" element={<Navigate to="/player/input" replace />} />
            <Route path="history" element={<Navigate to="/player/history" replace />} />
            <Route path="leaderboard" element={<Navigate to="/manager/leaderboard" replace />} />
            <Route path="scout" element={<Navigate to="/manager/leaderboard" replace />} />
            <Route path="scouting" element={<Navigate to="/manager/leaderboard" replace />} />
            <Route path="dashboard" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="tournaments" element={<Navigate to="/esports" replace />} />
            <Route path="turnamen" element={<Navigate to="/esports" replace />} />
            <Route path="team" element={<Navigate to="/teams" replace />} />
            <Route path="tim" element={<Navigate to="/teams" replace />} />
            <Route path="manager/team" element={<Navigate to="/manager/team-profile" replace />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
        </PlayerStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
  );
}
