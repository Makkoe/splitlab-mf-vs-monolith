import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// Independently built & deployed remote: checkout (port 5202)
export default defineConfig({
  plugins: [
    react(), federation({
      name: 'checkout',
      filename: 'remoteEntry.js',
      exposes: { './mount': './src/mount.tsx' },
      shared: { react: {}, 'react-dom': {}, 'react-dom/client': { version: '19.2.5' } },
    }),
  ],
  define: { __VUE_OPTIONS_API__: 'true', __VUE_PROD_DEVTOOLS__: 'false', __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' },
  build: { target: 'esnext', minify: true, cssCodeSplit: false },
  preview: { port: 5202, cors: true },
  server: { port: 5202, cors: true },
})
