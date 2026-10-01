import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { validateApiUrl, validateGoogleClientId } from './src/config/environment.js'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')
  validateApiUrl(env.VITE_API_URL, command === 'build')
  validateGoogleClientId(env.VITE_GOOGLE_CLIENT_ID)
  return { plugins: [react()] }
})
