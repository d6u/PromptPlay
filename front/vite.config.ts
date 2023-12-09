import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react()],
  envDir: "../.environments/vite-dev",
  server: {
    port: 3000,
  },
});
