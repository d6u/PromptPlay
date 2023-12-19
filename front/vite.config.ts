import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
// import mkcert from 'vite-plugin-mkcert';

// Check https://vitejs.dev/config/ for reference
export default defineConfig({
  plugins: [
    react(),
    // Use mkcert() to provide a self-signed certificate for localhost.
    // Avoid using this when paired with local API server due to
    // cookie setting limits, since local API server doesn't support https yet.
    // mkcert(),
  ],
  envDir: '../.environments/vite',
  server: {
    port: 3000,
  },
});
