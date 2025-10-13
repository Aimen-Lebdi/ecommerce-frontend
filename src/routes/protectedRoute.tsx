import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { useEffect } from "react";
import { verifyToken, handleTokenExpiration, signOut } from "../features/auth/authSlice"; // Import the new actions

export default function ProtectedRoute({ role }: { role: "user" | "admin" }) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, tokenExpired } = useAppSelector(
    (state) => state.auth
  );

  // Verify token when component mounts
  useEffect(() => {
    if (!isAuthenticated && !loading && !tokenExpired) {
      // Only verify if we're not already authenticated and not currently loading
      const token = localStorage.getItem("token");
      if (token) {
        dispatch(verifyToken());
      }
    }
  }, [dispatch, isAuthenticated, loading, tokenExpired]);

  // Handle API errors (token expiration) from other parts of the app
  useEffect(() => {
    const handleUnauthorized = () => {
      // This can be triggered from your API interceptors
      dispatch(handleTokenExpiration());
    };

    window.addEventListener('tokenExpired', handleUnauthorized as EventListener);

    return () => {
      window.removeEventListener('tokenExpired', handleUnauthorized as EventListener);
    };
  }, [dispatch]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated && user && !user.active) {
    // Sign out the user
    dispatch(signOut());
    return (
      <Navigate 
        to="/sign-in" 
        state={{ 
          from: location,
          error: "Your account has been deactivated. Please contact support for assistance."
        }} 
        replace 
      />
    );
  }

  // If token expired or not authenticated, redirect to sign in with the current location
  if (!isAuthenticated || !user || tokenExpired) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // If role is admin but user is not admin, redirect to home
  if (role === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the protected content
  return <Outlet />;
}