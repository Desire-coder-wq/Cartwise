import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const API = env.VITE_API_URL || 'https://cartwise-8z9i.onrender.com'

  return defineConfig({
    plugins: [vue()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: API,
          changeOrigin: true
        },
        '/auth': {
          target: API,
          changeOrigin: true
        },
        '/dashboard': {
          target: API,
          changeOrigin: true
        },
        '/history': {
          target: API,
          changeOrigin: true
        }
      }
    }
  })
}
