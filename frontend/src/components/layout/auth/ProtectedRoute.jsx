import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

/**
 * Protects private routes.
 * Redirects unauthenticated users to login page.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;