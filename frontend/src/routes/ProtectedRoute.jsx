import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingScreen } from "../components/layout/LoadingScreen";
import { useAuth } from "../hooks/useAuth";
import { routePaths } from "./routePaths";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
