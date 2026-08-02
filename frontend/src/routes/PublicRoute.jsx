import { Navigate, Outlet } from "react-router-dom";

import { LoadingScreen } from "../components/layout/LoadingScreen";
import { useAuth } from "../hooks/useAuth";
import { routePaths } from "./routePaths";

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={routePaths.dashboard} replace />;
  }

  return <Outlet />;
}
