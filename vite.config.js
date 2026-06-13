import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addProxyAuth(proxy) {
  proxy.on('proxyReq', (proxyReq, req) => {
    // reenviar cookies
    if (req.headers.cookie) {
      proxyReq.setHeader('cookie', req.headers.cookie);
    }

    // reenviar Authorization header
    if (req.headers.authorization) {
      proxyReq.setHeader('authorization', req.headers.authorization);
    }
  });
}
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/restaurants': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/customers': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/visits': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/badges': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/pointsWallets': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/reviews': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/rewards': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/dishes': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/employees': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/rewardRedemptions': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/statistics': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/dish-ratings': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/chat': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        ws: true,
      },
      '/support': {
        target: 'http://127.0.0.1:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
    },
  },
});
