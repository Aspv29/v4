import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL: This ensures assets are loaded relatively in the Android APK
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});