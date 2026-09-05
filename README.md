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
- `loginctl enable-linger $USER` is on, so it starts on boot without needing
  an active login session
- After changing code: `npm run build && systemctl --user restart disaster-zone`
- Logs: `journalctl --user -u disaster-zone -f`

### TLS: a locally-trusted CA, not just a self-signed cert

A plain self-signed certificate encrypts the connection but isn't in any
browser's trust store, so most browsers - Firefox in particular - keep
showing "Connection not secure" even after you click through the warning,
and withhold sensitive permissions (Geolocation included) from a connection
they don't consider trustworthy. Clicking past the warning is not enough to
get geolocation working.

The fix used here: a small local Certificate Authority signs the server's
certificate. Once a device trusts that one CA, every certificate it issues
(including this one) is fully trusted with no warnings at all - not a
per-site exception.

- `.certs/` holds `ca.key`/`ca.crt` (the CA) and `localhost.key`/`localhost.crt`
  (the server cert, signed by that CA) - all gitignored, machine-specific,
  regenerated per machine, never committed
- The CA's **public** certificate (not the key) is also copied to
  `public/disaster-zone-ca.crt`, so it ships in every build and is
  downloadable from the running site itself - that file is safe to commit,
  it contains no private key material

**One-time setup per device** that needs geolocation to work (phones included):
1. Visit `https://<this-machine's-LAN-IP>:8080/disaster-zone-ca.crt` (you'll
   still get the untrusted-cert warning for this one download - click through
   it, downloading a file doesn't require trust) and save/open the file
2. Android: Settings -> Security (or Encryption & Credentials) -> "Install a
   certificate" -> **CA certificate** -> select the downloaded file. Android
   will show a "network may be monitored" notice afterwards - expected and
   harmless, it's just flagging that a user-installed CA is active
3. Reload the site - the padlock/site info should now show fully secure, and
   the Geolocation permission prompt should appear normally

### Regenerating the certificates

Needed if this machine's LAN IP changes, or a cert expires (CA: 10 years,
server cert: 825 days). Re-running this replaces `.certs/*`; devices that
already trust the CA (`ca.crt` unchanged) don't need to reinstall anything -
only regenerate the CA itself (delete `ca.key`/`ca.crt` first) if you want to
re-trust from scratch.

```bash
hostname -I   # confirm the current LAN IP; update IP.2 in san.cnf below if it changed
cd .certs

# Only if ca.key/ca.crt don't already exist (skip if reusing the trusted CA):
cat > ca.cnf << 'EOF'
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_ca
prompt = no

[req_distinguished_name]
CN = Disaster Zone Local Dev CA

[v3_ca]
basicConstraints = critical, CA:true
keyUsage = critical, keyCertSign, cRLSign
subjectKeyIdentifier = hash
EOF
openssl req -x509 -nodes -newkey rsa:2048 -keyout ca.key -out ca.crt -days 3650 -config ca.cnf -extensions v3_ca
cp ca.crt ../public/disaster-zone-ca.crt

# Server cert (re-run any time - SAN list, expiry, etc.):
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
openssl req -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.csr -config san.cnf
openssl x509 -req -in localhost.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out localhost.crt -days 825 -extfile san.cnf -extensions v3_req
rm -f localhost.csr

cd .. && npm run build && systemctl --user restart disaster-zone
```

A GitHub Actions workflow (`.github/workflows/deploy.yml`) also exists to
publish to GitHub Pages from `gh-pages` on push to `main`, if that's wanted
later instead of/alongside local hosting - it isn't currently wired up to
anything since nothing has been pushed to GitHub yet.
