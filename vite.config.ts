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
          if (pkg === "recharts" || pkg.startsWith("d3-") || pkg === "victory-vendor") {
            return "charts-vendor";
          }
          if (pkg === "lucide-react" || pkg === "@tabler/icons-react") {
            return "icons-vendor";
          }
          return undefined;
        },
      },
    },
  },
});
