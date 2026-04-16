import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('@react-three')) {
            return 'r3f-vendor';
          }

          if (id.includes('three') || id.includes('meshline')) {
            return 'three-core';
          }

          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }

          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'forms-vendor';
          }

          if (id.includes('@tanstack')) {
            return 'query-vendor';
          }

          if (id.includes('framer-motion')) {
            return 'motion-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});
