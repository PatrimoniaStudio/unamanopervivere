import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In sviluppo locale (npm run dev) inoltra le chiamate /api al backend Express
      "/api": "http://localhost:3000",
    },
  },
});
