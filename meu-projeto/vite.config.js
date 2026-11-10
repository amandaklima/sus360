import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: process.env.USE_POLLING ? { usePolling: true, interval: 300 } : undefined,
  },
})
