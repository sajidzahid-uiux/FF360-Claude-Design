import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@dev-app': path.resolve(__dirname, '../dev-app/src'),
      '@fieldflow360/org-ui': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 3002,
    open: true,
  },
});

