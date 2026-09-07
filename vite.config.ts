import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from a GitHub Pages project page at /disasterZone/, so assets need
// that base path. import.meta.env.BASE_URL resolves to it at runtime.
export default defineConfig({
  base: '/disasterZone/',
  plugins: [tailwindcss(), react()],
})
