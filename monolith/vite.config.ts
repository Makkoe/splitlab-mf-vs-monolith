import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Classic SPA monolith: one project, one build, one bundle, one deploy.
export default defineConfig({
  plugins: [react()],
  define: { __VUE_OPTIONS_API__: 'true', __VUE_PROD_DEVTOOLS__: 'false', __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' },
  build: {
    target: 'esnext',
    minify: true,
    rolldownOptions: { output: { codeSplitting: false } },
  },
  server: { port: 5300, strictPort: true, fs: { allow: ['..'] } },
  preview: { port: 5300 },
})