import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // احذفي سطر publicDir تماماً الآن
  server: {
    host: true,
    port: 8080,
    allowedHosts: true
  }
})
