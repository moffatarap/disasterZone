# Disaster Zone

A live map of New Zealand earthquakes and volcanic alert levels, sourced from
[GeoNet](https://www.geonet.org.nz/)'s public API.

This is a rebuild of a 2016–2018 university project (MDDN352, Victoria
University of Wellington) on a modern stack: React + TypeScript + Vite,
MapLibre GL with OpenStreetMap tiles (no API key/billing required), and
TanStack Query for data fetching. The original project's source is preserved
on the `gh-pages` branch and the `legacy-v1` tag.

## Status

Phase 1 (current): live earthquake and volcano data, map, recent-events
sidebar, event detail popups, geolocation, and reverse-geocoded address.

Not yet ported: the original's fire/flood/hurricane/tornado placeholder
events (never wired to real data in the original either).

## Development

```bash
npm install
npm run dev
```

The browser will ask for location permission; if denied, the map falls back
to a New Zealand-wide view.

## Build

```bash
npm run build
npm run preview
```

## Deployment

Hosted on **GitHub Pages** at
`https://<owner>.github.io/disasterZone/`, published by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Every push and pull request runs `npm ci`, `npm run lint` and `npm run build`
on Node 24. On a push to `main` (or a manual run), the built `dist/` is then
uploaded and deployed to Pages. Pull requests build and lint but do not
deploy.

Pages serves over HTTPS with a valid certificate, so the Geolocation API
works for every visitor with no extra setup.

One-time repo setting: **Settings → Pages → Build and deployment → Source:
GitHub Actions**.

### Base path

The site lives under `/disasterZone/`, so `vite.config.ts` sets
`base: '/disasterZone/'` and any runtime-built asset URL uses
`import.meta.env.BASE_URL`. If the repository is renamed, update `base` to
match.

### Dev server port and local HTTPS

`vite.config.ts` pins the dev server to **port 8080** (`strictPort`, so a
clash fails loudly instead of drifting to another port).

It also auto-enables HTTPS on the LAN when a cert/key pair is present:

- **No certs** (fresh clone, CI): plain HTTP on `http://localhost:8080/`.
  `localhost` is a secure context, so geolocation works with no certificate.
- **Certs in `.certs/`** (`localhost.key` + `localhost.crt`, gitignored):
  the server switches to HTTPS and binds all interfaces, so another device on
  the same network can reach it at `https://<this-machine-ip>:8080/`. A phone
  needs HTTPS for the Geolocation API - plain `http://<ip>` won't do.

The bundled `.certs/` cert is signed by a local CA (`.certs/ca.crt`) and
lists `localhost`, `127.0.0.1` and the dev machine's LAN IP in its SAN. On
another device either click past the certificate warning (the connection is
still real TLS, which is what the secure-context check wants) or install
`.certs/ca.crt` as a trusted CA to clear it. Regenerate the cert with
`.certs/san.cnf` if the machine's IP changes.

Note: the `gh-pages` branch is unrelated to hosting - it only holds the
archived 2016-2018 original (also tagged `legacy-v1`).
