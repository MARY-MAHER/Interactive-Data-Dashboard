import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // إعدادات المجلد العام لضمان نسخ ملف _redirects
  publicDir: 'public', 

  // إعدادات السيرفر لـ Railway
  server: {
    host: true,
    port: 8080,
    allowedHosts: true 
  },
  
  preview: {
    host: true,
    port: 8080,
    allowedHosts: true
  }
})
