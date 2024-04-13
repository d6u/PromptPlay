import { defineConfig } from 'vite';

// This is for vitest to work with local packages' conditional "exports"
export default defineConfig({
  resolve: {
    // match with local packages' conditional "exports",
    // so we can load up .ts files directly without compile packages
    conditions: ['ts'],
  },
});
