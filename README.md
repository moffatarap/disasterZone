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

### Local HTTPS (optional)

`npm run dev` serves over plain HTTP on `localhost`, which is a secure
context, so geolocation works in local development with no certificate. Only
if you need to reach the dev server from another device by IP do you need
HTTPS locally; drop a cert/key in `.certs/` (gitignored) and point your
server at it.

Note: the `gh-pages` branch is unrelated to hosting - it only holds the
archived 2016-2018 original (also tagged `legacy-v1`).
