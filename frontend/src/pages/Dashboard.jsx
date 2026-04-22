import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getSocialAccounts } from "../services/socialAnalyticsService.js";

/**
 * Dashboard page
 * Purpose:
 * - Show quick account overview
 * - Show current selected/first account
 * - Show basic summary and navigation feel
 *
 * NOTE:
 * Detailed charts and metrics are moved to Analytics page.
 */
const Dashboard = () => {
  const { token } = useAuth();

  const [socialAccounts, setSocialAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never synced";

    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const accountsData = await getSocialAccounts(token);
        const accounts = accountsData.accounts || [];

        setSocialAccounts(accounts);

        if (accounts.length > 0) {
          setSelectedAccount(accounts[0]);
        } else {
          setSelectedAccount(null);
        }
      } catch (err) {
        console.error("Dashboard overview load error:", err);
        setError("Failed to load dashboard overview");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-3 text-gray-600">
          Welcome to your social media analytics workspace.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No accounts */}
      {!loading && socialAccounts.length === 0 && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            No Connected Social Account
          </h2>
          <p className="mt-2 text-gray-600">
            Connect a social account to start syncing analytics and using AI.
          </p>
        </div>
      )}

      {/* Overview cards */}
      {selectedAccount && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">Current Account</p>
            <p className="mt-2 text-lg font-semibold text-gray-800">
              @{selectedAccount.username}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">Platform</p>
            <p className="mt-2 text-lg font-semibold capitalize text-gray-800">
              {selectedAccount.platform}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">Last Synced</p>
            <p className="mt-2 text-lg font-semibold text-gray-800">
              {formatDateTime(selectedAccount.lastSyncedAt)}
            </p>
          </div>
        </div>
      )}

      {/* Summary section */}
      {selectedAccount && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800">
            Quick Overview
          </h2>

          <p className="mt-3 text-gray-600">
            Use the Analytics page to explore detailed charts, metrics, sync
            activity, and AI-generated insights for your connected accounts.
          </p>

          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Current active account:
              <span className="ml-2 font-medium text-gray-800">
                @{selectedAccount.username}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;