import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves this from a project-page subpath (/disasterZone/), so
// the CI build needs that base. Local builds serve from the root, so they
// use '/'. GITHUB_ACTIONS is set to "true" only on the CI runner. Any
// runtime-built asset URL still goes through import.meta.env.BASE_URL.
const base = process.env.GITHUB_ACTIONS ? '/disasterZone/' : '/'

// Optional local HTTPS (see README "Local HTTPS"). If a cert/key pair is
// present in .certs/ (gitignored), serve over HTTPS and expose on the LAN so
// another device - a phone, which needs a secure context for geolocation -
// can reach the dev server. No certs: unchanged, plain HTTP on localhost.
const keyPath = resolve('.certs/localhost.key')
const certPath = resolve('.certs/localhost.crt')
const https =
  existsSync(keyPath) && existsSync(certPath)
    ? { key: readFileSync(keyPath), cert: readFileSync(certPath) }
    : undefined

export default defineConfig({
  base,
  plugins: [tailwindcss(), react()],
  // Pinned to 8080 so the dev URL is always https://192.168.1.11:8080/ (a phone
  // bookmark, mainly). strictPort makes a clash fail loudly instead of silently
  // drifting to the next free port.
  server: {
    port: 8080,
    strictPort: true,
    ...(https ? { host: true, https } : {}),
  },
})
