import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In local dev use `vercel dev` which serves both frontend + API on one port.
    // For standalone client-only dev, uncomment the proxy below:
    // proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } },
  },
});
