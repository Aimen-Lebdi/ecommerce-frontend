import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { store } from "./app/Store.ts";
import { Provider } from "react-redux";
import { i18nReady } from "./i18n";

// Wait for the initial language's translations (lazy-loaded for fr/ar) so the
// first paint is never raw translation keys.
i18nReady.then(() => {
  createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
});
