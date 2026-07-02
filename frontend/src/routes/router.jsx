import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import AIChat from "../pages/AIChat";
import Analytics from "../pages/Analytics";
import CreatorScore from "../pages/CreatorScore";
import Dashboard from "../pages/Dashboard";
import Instagram from "../pages/Instagram";
import Insights from "../pages/Insights";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Notes from "../pages/Notes";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { routePaths } from "./routePaths";

// Routes are grouped by layout so later auth guards can be added without reshaping pages.
export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFound />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to={routePaths.dashboard} replace /> },
              { path: "dashboard", element: <Dashboard /> },
              { path: "analytics", element: <Analytics /> },
              { path: "creator-score", element: <CreatorScore /> },
              { path: "insights", element: <Insights /> },
              { path: "ai-chat", element: <AIChat /> },
              { path: "notes", element: <Notes /> },
              { path: "instagram", element: <Instagram /> },
              { path: "settings", element: <Settings /> },
              { path: "profile", element: <Profile /> },
              { path: "landing", element: <Landing /> },
              { path: "*", element: <NotFound /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Signup /> },
          { path: "verify-email", element: <VerifyEmail /> },
          { path: "signup", element: <Navigate to={routePaths.register} replace /> },
        ],
      },
    ],
  },
]);
