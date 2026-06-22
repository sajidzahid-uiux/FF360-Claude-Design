import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@fieldflow360/org-ui': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 3010,
    open: true,
  },
});
