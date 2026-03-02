import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8080,
    allowedHosts: true // هنجرب نخليها true بدون مصفوفة
  },
  // الجزء ده هو اللي هيشغل الموقع على ريلواي
  preview: {
    host: true,
    port: 8080,
    allowedHosts: true
  }
})