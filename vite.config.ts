import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const legacyOrigin = env.VITE_DEV_LEGACY_ORIGIN || 'https://localhost:4000'
  const sessionPath = (env.VITE_SESSION_PATH || '/api/me').replace(/^\/?/, '/')

  return {
    plugins: [react(), basicSsl()],
    server: {
      port: 9001,
      proxy: {
        [sessionPath]: {
          target: legacyOrigin,
          changeOrigin: true,
          // Legacy dev HTTPS often uses self-signed / mkcert certs Node does not trust.
          secure: false,
        },
      },
    },
  }
})
