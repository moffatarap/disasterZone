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
required), serving the production build with `serve` over **HTTPS** - the
Geolocation API refuses to run at all in a non-secure context, and a plain
`http://<lan-ip>` origin (anything other than `localhost`) counts as one, so
this doesn't work over plain HTTP for anyone on the network but you:

- Unit file: `~/.config/systemd/user/disaster-zone.service`
- Runs `serve -s dist -l 8080 --ssl-cert .certs/localhost.crt --ssl-key
  .certs/localhost.key` from this project directory
- `.certs/` holds a self-signed cert generated with `openssl` (see below) -
  gitignored, machine-specific, never committed
- `loginctl enable-linger $USER` is on, so it starts on boot without needing
  an active login session
- After changing code: `npm run build && systemctl --user restart disaster-zone`
- Logs: `journalctl --user -u disaster-zone -f`

### Regenerating the self-signed certificate

Needed if this machine's LAN IP changes, or the cert expires (825 days). The
browser will show a "connection isn't private" / "invalid certificate"
warning on first visit from each device - that's expected for a self-signed
cert; click through it (Advanced -> Proceed) once. The connection is still
genuinely encrypted and satisfies the browser's secure-context requirement
for geolocation - the warning is just about trust, not encryption.

```bash
hostname -I   # confirm the current LAN IP; update IP.2 below if it changed
mkdir -p .certs && cd .certs
cat > san.cnf << 'EOF'
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = Disaster Zone Local Dev

[v3_req]
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
IP.2 = 192.168.1.11
EOF
openssl req -x509 -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.crt -days 825 -config san.cnf -extensions v3_req
cd .. && systemctl --user restart disaster-zone
```

A GitHub Actions workflow (`.github/workflows/deploy.yml`) also exists to
publish to GitHub Pages from `gh-pages` on push to `main`, if that's wanted
later instead of/alongside local hosting - it isn't currently wired up to
anything since nothing has been pushed to GitHub yet.
