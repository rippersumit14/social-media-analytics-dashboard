import { Routes, Route } from "react-router-dom";

// Public Pages
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

// Private Pages
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import AIChat from "./pages/AIChat.jsx";

// Layout + Auth
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/layout/auth/ProtectedRoute.jsx";

// Fallback
import NotFound from "./pages/NotFound.jsx";

/**
 * App Routing Structure
 *
 * Public Routes:
 * - /          → Login
 * - /signup    → Signup
 *
 * Protected Routes (inside Layout):
 * - /dashboard → Overview page
 * - /analytics → Charts + metrics + AI insights
 * - /ai-chat   → Full chatbot page
 *
 * Layout:
 * - Sidebar
 * - Navbar
 * - Outlet (renders child routes)
 */
function App() {
  return (
    <Routes>
      {/* ========================= */}
      {/* PUBLIC ROUTES (no auth) */}
      {/* ========================= */}

      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ========================= */}
      {/* PROTECTED ROUTES (auth required) */}
      {/* ========================= */}

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard (summary) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Analytics (charts + insights) */}
        <Route path="/analytics" element={<Analytics />} />

        {/* AI Chat (new feature) */}
        <Route path="/ai-chat" element={<AIChat />} />
      </Route>

      {/* ========================= */}
      {/* FALLBACK ROUTE */}
      {/* ========================= */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;