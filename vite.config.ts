import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/disasterZone/ (project page, no custom domain)
export default defineConfig({
  base: '/disasterZone/',
  plugins: [react()],
})
