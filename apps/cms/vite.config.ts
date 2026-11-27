import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_CMS_BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
    hmr: process.env.DISABLE_HMR === "true" ? false : {
      host: "localhost",
      port: 3002,
      protocol: "ws",
    },
  },
});
