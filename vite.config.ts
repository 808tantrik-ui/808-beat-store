import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@config': path.resolve(__dirname, './packages/config/src'),
      '@shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist/web',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
