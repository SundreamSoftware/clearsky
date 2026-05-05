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
      '/waqi-api': {
        target: 'https://api.waqi.info',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Strip /waqi-api prefix and inject token as URL param
            let newPath = proxyReq.path.replace(/^\/waqi-api/, '');
            const token = env.VITE_WAQI_TOKEN;
            if (token) {
              const sep = newPath.includes('?') ? '&' : '?';
              newPath = `${newPath}${sep}token=${token}`;
            }
            proxyReq.path = newPath;
          });
        },
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
