import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/whatsapp': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
