import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { LoadingScreen } from "../components/layout/LoadingScreen";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import {
  AIChat,
  Analytics,
  CreatorScore,
  Dashboard,
  Instagram,
  InstagramCallback,
  Insights,
  Landing,
  Login,
  NotFound,
  Notes,
  Profile,
  Privacy,
  Recommendations,
  Settings,
  Signup,
  Terms,
  VerifyEmail,
} from "./lazyPages";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { routePaths } from "./routePaths";

function withSuspense(element) {
  return <Suspense fallback={<LoadingScreen message="Loading page" />}>{element}</Suspense>;
}

// Routes are grouped by layout so later auth guards can be added without reshaping pages.
export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: withSuspense(<NotFound />),
    children: [
      { index: true, element: withSuspense(<Landing />) },
      { path: "landing", element: <Navigate to="/" replace /> },
      { path: "privacy", element: withSuspense(<Privacy />) },
      { path: "terms", element: withSuspense(<Terms />) },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to={routePaths.dashboard} replace /> },
              { path: "dashboard", element: withSuspense(<Dashboard />) },
              { path: "analytics", element: withSuspense(<Analytics />) },
              { path: "creator-score", element: withSuspense(<CreatorScore />) },
              { path: "insights", element: withSuspense(<Insights />) },
              { path: "recommendations", element: withSuspense(<Recommendations />) },
              { path: "ai-chat", element: withSuspense(<AIChat />) },
              { path: "notes", element: withSuspense(<Notes />) },
              { path: "instagram", element: withSuspense(<Instagram />) },
              { path: "instagram/callback", element: withSuspense(<InstagramCallback />) },
              { path: "settings", element: withSuspense(<Settings />) },
              { path: "profile", element: withSuspense(<Profile />) },
              { path: "*", element: withSuspense(<NotFound />) },
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
          { path: "login", element: withSuspense(<Login />) },
          { path: "register", element: withSuspense(<Signup />) },
          { path: "verify-email", element: withSuspense(<VerifyEmail />) },
          { path: "signup", element: <Navigate to={routePaths.register} replace /> },
        ],
      },
    ],
  },
]);
