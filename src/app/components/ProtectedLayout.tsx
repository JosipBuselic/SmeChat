import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { UserStatsProvider } from "../context/UserStatsContext";
import { useUIStrings } from "../i18n/uiStrings";

export function ProtectedLayout() {
  const { session, loading, configured } = useAuth();
  const location = useLocation();
  const ui = useUIStrings();

  if (!configured) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50">
        <p className="text-gray-600">{ui.common.loading}</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <UserStatsProvider>
      <Outlet />
    </UserStatsProvider>
  );
}
