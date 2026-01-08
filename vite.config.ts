import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Enable React Server Components
    include: "**/*.tsx",
  })],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});