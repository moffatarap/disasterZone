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

## Hosting

Currently self-hosted as a systemd **user** service on this machine (no sudo
required), serving the production build with `serve`:

- Unit file: `~/.config/systemd/user/disaster-zone.service`
- Runs `serve -s dist -l 8080` from this project directory
- `loginctl enable-linger $USER` is on, so it starts on boot without needing
  an active login session
- After changing code: `npm run build && systemctl --user restart disaster-zone`
- Logs: `journalctl --user -u disaster-zone -f`

A GitHub Actions workflow (`.github/workflows/deploy.yml`) also exists to
publish to GitHub Pages from `gh-pages` on push to `main`, if that's wanted
later instead of/alongside local hosting - it isn't currently wired up to
anything since nothing has been pushed to GitHub yet.
