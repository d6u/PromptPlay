import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// Check https://vitejs.dev/config/ for reference
export default defineConfig({
  plugins: [react()],
  envDir: "../.environments/vite",
  server: {
    port: 3000,
  },
});
