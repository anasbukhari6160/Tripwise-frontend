import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { validateApiUrl, validateGoogleClientId } from './src/config/environment.js'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')
  const isDevServer = command === 'serve'

  validateGoogleClientId(env.VITE_GOOGLE_CLIENT_ID)

  if (!isDevServer) {
    return { plugins: [react()] }
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: validateApiUrl(env.VITE_API_URL),
          changeOrigin: true,
        },
      },
    },
  }
})
