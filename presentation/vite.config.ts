import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: { port: 5110, strictPort: true },
  preview: { port: 5110 },
})
