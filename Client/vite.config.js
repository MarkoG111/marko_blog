import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const proxyPaths = [
  '/api/posts',
  '/api/categories',
  '/api/notifications',
  '/api/auth',
  '/api/users',
  '/api/comments',
  '/api/likes',
  '/api/images',
  '/api/followers',
  '/api/authorrequests',
  '/api/usecaselogs',
  '/api/register',
  '/api/login'
]

const createProxyConfig = (path) => ({
  target: 'http://localhost:5000',
  secure: false,
  changeOrigin: true,
  ws: path === '/api/notificationsHub',
})

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(proxyPaths.map((path) => [path, createProxyConfig(path)])),
  },
})
