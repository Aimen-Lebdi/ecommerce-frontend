import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { useEffect, useRef, useState } from "react";
import { 
  refreshToken, 
  handleTokenExpiration, 
  signOut 
} from "../features/auth/authSlice";

export default function ProtectedRoute({ role }: { role: "user" | "admin" }) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { 
    user, 
    isAuthenticated, 
    loading, 
    tokenExpired,
    accessToken,
    isRefreshing 
  } = useAppSelector((state) => state.auth);

  // Use ref to prevent multiple refresh attempts
  const hasAttemptedRefresh = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check authentication status ONCE on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");
      
      console.log('ProtectedRoute - Initial check:', {
        hasStoredTokens: !!storedAccessToken && !!storedRefreshToken,
        isAuthenticated,
        tokenExpired,
        hasAttemptedRefresh: hasAttemptedRefresh.current,
        location: location.pathname
      });
      
      // Only attempt refresh if:
      // 1. We haven't tried yet
      // 2. We have stored tokens
      // 3. Either not authenticated OR token expired OR no access token in state
      if (
        !hasAttemptedRefresh.current && 
        storedRefreshToken && 
        storedUser &&
        (!isAuthenticated || tokenExpired || !accessToken)
      ) {
        hasAttemptedRefresh.current = true;
        console.log('Attempting to refresh token...');
        
        try {
          await dispatch(refreshToken()).unwrap();
          console.log('Token refresh successful');
        } catch (error) {
          console.log('Token refresh failed:', error);
          hasAttemptedRefresh.current = false; // Reset on failure
        }
      }
      
      // Mark initialization as complete
      setIsInitializing(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Handle API errors (token expiration) from other parts of the app
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Token expired event received');
      dispatch(handleTokenExpiration());
      hasAttemptedRefresh.current = false; // Reset on expiration
    };

    window.addEventListener('tokenExpired', handleUnauthorized as EventListener);

    return () => {
      window.removeEventListener('tokenExpired', handleUnauthorized as EventListener);
    };
  }, [dispatch]);

  // Show loading spinner while initializing, checking auth state, or refreshing token
  if (isInitializing || loading || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle inactive user account
  if (isAuthenticated && user && !user.active) {
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

  // If not authenticated or token expired, redirect to sign in
  if (!isAuthenticated || !user || tokenExpired) {
    console.log('Redirecting to sign-in:', {
      isAuthenticated,
      hasUser: !!user,
      tokenExpired,
      from: location.pathname
    });
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // If role is admin but user is not admin, redirect to home
  if (role === "admin" && user.role !== "admin") {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the protected content
  console.log('Rendering protected content for user:', user.role, 'at', location.pathname);
  return <Outlet />;
}