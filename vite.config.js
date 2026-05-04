import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/restaurants': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/customers': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/visits': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/badges': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/pointsWallets': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/reviews': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/rewards': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/dishes': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/employees': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/rewardRedemptions': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/statistics': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
      '/dish-ratings': {
        target: 'http://localhost:1337',
        changeOrigin: true,
        configure: addProxyAuth,
      },
    },
  },
})
