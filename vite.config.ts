import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves this from a project-page subpath (/disasterZone/), so
// the CI build needs that base. Local builds serve from the root, so they
// use '/'. GITHUB_ACTIONS is set to "true" only on the CI runner. Any
// runtime-built asset URL still goes through import.meta.env.BASE_URL.
const base = process.env.GITHUB_ACTIONS ? '/disasterZone/' : '/'

export default defineConfig({
  base,
  plugins: [tailwindcss(), react()],
})
