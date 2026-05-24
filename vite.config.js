import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api/site': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/api/marketplace': {
        target: 'https://subrouter.com',
        changeOrigin: true,
        secure: true,
      },
      '/api/pricing': {
        target: 'https://subrouter.com',
        changeOrigin: true,
        secure: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
