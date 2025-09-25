/* eslint-disable @typescript-eslint/no-unused-vars */
import { ThemeProvider } from "./components/theme-provider";
import AppRoutes from "./routes/AppRoutes";
import SocketProvider from "./socket/useSocket";
import { useEffect } from "react";
import { useAppDispatch } from "./app/hooks";
import { setAuthData } from "./features/auth/authSlice";

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch(setAuthData({ user: parsedUser, token }));
      } catch (error) {
        // If parsing fails, clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  return (
    <SocketProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppRoutes />
      </ThemeProvider>
    </SocketProvider>
  );
};

export default App;
