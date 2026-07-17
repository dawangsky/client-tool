import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // .env* 不会自动进 process.env；代理目标必须在 config 里手动 loadEnv
  const env = loadEnv(mode, process.cwd(), '')
  const host = process.env.TAURI_DEV_HOST
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'
  const wsProxyTarget = env.VITE_WS_PROXY_TARGET || 'http://localhost:8081'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: 'ws',
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/ws': {
          target: wsProxyTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
