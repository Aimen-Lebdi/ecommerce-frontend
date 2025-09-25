import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function ProtectedRoute({ role }: { role: "user" | "admin" }) {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to sign in with the current location
  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // If role is admin but user is not admin, redirect to home
  if (role === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the protected content
  return <Outlet />;
}
