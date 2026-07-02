import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Keeps Vite configuration small until deployment-specific settings are needed.
export default defineConfig({
  plugins: [react()],
});
