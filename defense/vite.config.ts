import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5100,
    proxy: {
      '/lab-api': {
        target: 'http://localhost:5111',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/lab-api/, ''),
      },
    },
  },
})
