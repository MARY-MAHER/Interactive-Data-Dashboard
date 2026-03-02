import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // السطر اللي تحت ده هيشيل أي خط أحمر في الفيجوال ستوديو
    // @ts-expect-error - Vite 6 allowedHosts
    allowedHosts: ['all'] 
  }
})