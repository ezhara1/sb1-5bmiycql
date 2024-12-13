import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  define: {
    'process.env': {},
    global: {}
  },
  server: {
    port: 3000,
    strictPort: true, // Don't automatically try other ports
    host: true,
    proxy: {
      '/api/thetadata': {
        target: 'http://localhost:25510',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thetadata/, '/v2'),
      },
    },
  }
});
