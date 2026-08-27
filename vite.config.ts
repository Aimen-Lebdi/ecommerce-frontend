import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        name: "Cliqo",
        short_name: "Cliqo",
        description:
          "COD-first Algerian marketplace: shop, pay cash on delivery or card, and track your order.",
        // Ink from DESIGN.md — oklch(0.208 0.042 265.755) in hex form
        theme_color: "#0f172a",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split stable vendor libraries into cached chunks so app-code changes
        // don't invalidate the whole bundle on deploy.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          const segments = id
            .slice(id.indexOf("node_modules") + "node_modules".length + 1)
            .split("/");
          const pkg = segments[0].startsWith("@")
            ? `${segments[0]}/${segments[1]}`
            : segments[0];

          if (
            pkg === "react" ||
            pkg === "react-dom" ||
            pkg === "scheduler" ||
            pkg.startsWith("react-router")
          ) {
            return "react-vendor";
          }
          if (
            pkg === "@reduxjs/toolkit" ||
            pkg === "react-redux" ||
            pkg === "redux" ||
            pkg === "reselect" ||
            pkg === "immer" ||
            pkg === "redux-thunk"
          ) {
            return "state-vendor";
          }
          // NOTE: Do NOT manually split recharts/d3 into a "charts-vendor"
          // chunk. Forcing them into their own chunk makes Rollup hoist its
          // shared CommonJS interop helpers into that chunk, giving
          // react-vendor a static import back into it
          // (react-vendor -> charts-vendor -> react-vendor cycle). The cycle
          // makes charts-vendor evaluate before React initializes and crashes
          // at startup with "Cannot access 'S' before initialization".
          // Recharts is only imported by lazy admin dashboard components, so
          // default chunking already keeps it out of the entry bundle.
          // Split icon vendors by consumer: lucide-react powers the storefront
          // UI (eagerly imported), while @tabler/icons-react is only reachable
          // from lazy admin chunks. A merged "icons-vendor" chunk lands in the
          // entry modulepreload set, forcing every visitor to download Tabler
          // bytes they never execute. Both libs are pure ESM, so unlike
          // recharts there is no CommonJS-interop cycle risk in splitting them.
          if (pkg === "lucide-react") {
            return "icons-lucide";
          }
          if (pkg === "@tabler/icons-react") {
            return "icons-tabler";
          }
          return undefined;
        },
      },
    },
  },
});
