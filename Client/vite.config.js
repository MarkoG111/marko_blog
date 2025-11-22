import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [react()],
    server: isDev
      ? {
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
          },
          '/api/notificationsHub': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
            ws: true
          }
        },
      }
      : undefined
  };
});