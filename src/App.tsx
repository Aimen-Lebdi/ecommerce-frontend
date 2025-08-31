// import { ThemeProvider } from "./components/theme-provider";
import { ThemeProvider } from "./components/theme-provider";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    // <AppRoutes />
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  )

};

export default App;
