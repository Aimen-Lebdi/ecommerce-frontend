import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Moves keyboard focus to #main-content after client-side navigation so
 * screen-reader and keyboard users start each page at the content, not stuck
 * on the header. Skips the initial mount to avoid stealing focus on load.
 */
const RouteFocus = () => {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const main = document.getElementById("main-content");
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
};

export default RouteFocus;
