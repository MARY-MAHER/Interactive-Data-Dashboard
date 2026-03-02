import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    allowedHosts: [
      'all',
      'stmatthew-production.up.railway.app',
      '.up.railway.app',
      '.railway.app'
    ]
  }
})