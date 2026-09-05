import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Self-hosted at the server root (see the systemd user service in README.md),
// not a GitHub Pages project page - so no /disasterZone/ base path needed.
export default defineConfig({
  plugins: [tailwindcss(), react()],
})
