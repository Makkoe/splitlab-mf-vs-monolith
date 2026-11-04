import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// Host (container): knows only remote URLs РІР‚вЂќ remotes are resolved at RUNTIME.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        catalog: 'http://localhost:5201/assets/remoteEntry.js',
        checkout: 'http://localhost:5202/assets/remoteEntry.js',
        reviews: 'http://localhost:5203/assets/remoteEntry.js',
      },
      shared: { react: {}, 'react-dom': {}, 'react-dom/client': { version: '19.2.5' } },
    }),
  ],
  build: { target: 'esnext', minify: true },
  server: { port: 5200, strictPort: true, fs: { allow: ['../..'] } },
  preview: { port: 5200 },
})