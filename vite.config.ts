import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.gios.gov.pl/pjp-api/v1/rest',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/openaq-api': {
        target: 'https://api.openaq.org/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openaq-api/, ''),
        headers: env.VITE_OPENAQ_API_KEY ? { 'X-API-Key': env.VITE_OPENAQ_API_KEY } : {},
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
  };
});
