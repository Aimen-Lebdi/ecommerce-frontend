import { DirectionProvider } from "@radix-ui/react-direction";
import { ThemeProvider } from "./components/theme-provider";
import AppRoutes from "./routes/AppRoutes";
import SocketProvider from "./socket/useSocket";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchCart, resetCart } from "./features/cart/cartSlice";
import { Toaster } from "sonner";

const App = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { i18n } = useTranslation();

  // Keep Radix primitives (Tabs, RadioGroup, Select, Dialog, Tooltip, ...) in
  // sync with the HTML dir that Header/SiteHeader set on language change.
  // Without this, Radix roots render dir="ltr" by default and override
  // <html dir="rtl">, so tables and radios never flip in Arabic.
  const direction = i18n.language === "ar" ? "rtl" : "ltr";

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
    <DirectionProvider dir={direction}>
      <SocketProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppRoutes />
          <Toaster position="top-right" richColors={true} closeButton={true} />
        </ThemeProvider>
      </SocketProvider>
    </DirectionProvider>
  );
};

export default App;
