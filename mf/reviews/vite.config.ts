import { defineConfig } from 'vite'
import federation from '@originjs/vite-plugin-federation'

// Independently built & deployed remote: reviews (port 5203)
export default defineConfig({
  plugins: [
    federation({
      name: 'reviews',
      filename: 'remoteEntry.js',
      exposes: { './mount': './src/mount.ts' },
      shared: ['vue'],
    }),
  ],
  define: { __VUE_OPTIONS_API__: 'true', __VUE_PROD_DEVTOOLS__: 'false', __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' },
  build: { target: 'esnext', minify: true, cssCodeSplit: false },
  preview: { port: 5203, cors: true },
  server: { port: 5203, cors: true },
})
