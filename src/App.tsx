import { ThemeProvider } from "./components/theme-provider";
import AppRoutes from "./routes/AppRoutes";
import SocketProvider from "./socket/useSocket";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchCart, resetCart } from "./features/cart/cartSlice";
import { Toaster } from "sonner";

const App = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Keep the cart in sync with auth state:
    // - authenticated: fetch the user's cart so the header badge is fresh on every page
    // - logged out / token expired: reset local cart state (no API call)
    if (isAuthenticated) {
      dispatch(fetchCart());
    } else {
      dispatch(resetCart());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <SocketProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppRoutes />
        <Toaster position="top-right" richColors={true} closeButton={true} />
      </ThemeProvider>
    </SocketProvider>
  );
};

export default App;
