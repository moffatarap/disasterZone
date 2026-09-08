# Decision log

The "why" behind choices that aren't obvious from the code, kept here so the
source comments can stay short and describe only what the code does *now*.
When you change something a note here explains, update the note.

Entries are dated where the date matters. Newest context last within each
section.

---

## Stack and hosting

### React + TypeScript + Vite, MapLibre GL, TanStack Query

A 2026 rebuild of a 2016-2018 university project (MDDN352, Victoria University
of Wellington). The original is preserved on the `gh-pages` branch and the
`legacy-v1` tag - that branch is history only, not the deploy target.

### Hosted on GitHub Pages, deployed from Actions

- **A pure static site.** No backend, no server-side state; everything it
  needs at runtime comes from public APIs. Pages is a natural fit and needs
  no infrastructure to keep running.
- **Deployed with `actions/deploy-pages`, not a `gh-pages` branch.** The
  artifact-based flow keeps the built output out of git entirely and leaves
  the `gh-pages` branch free to hold the archived original.
- **HTTPS comes for free.** The Geolocation API refuses to run in a
  non-secure context; `*.github.io` is served over HTTPS with a valid cert,
  so every visitor gets geolocation with no setup. (`localhost` also counts
  as secure, so `npm run dev` works without a certificate too.)
- **`base: '/disasterZone/'`.** A project page is served from a subpath, so
  Vite needs the base set and any runtime-built URL uses
  `import.meta.env.BASE_URL`. Rename the repo and this has to change with it.

---

## Map and basemap

### Esri "World Dark Gray Canvas" raster tiles

- **No API key, no billing** - unlike the original's Google Maps setup.
- Chosen over plain OSM's bright default styling because its dark palette
  matches the app's navy chrome and makes the severity-coloured markers and
  alert circles read more vividly.
- **CARTO's equivalent dark tiles were rejected** - they now require an API
  key. This wasn't obvious from the HTTP status: CARTO returns a `200` with an
  "API KEY REQUIRED" watermark tile rather than an error, so it was only
  caught by inspecting a fetched tile's actual image content.
- Esri splits base terrain and place-name labels into two separate raster
  layers, stacked in `BASEMAP_STYLE`.
- **ArcGIS tile URLs order `{z}/{y}/{x}`** (row before column), reversed from
  every other provider's `{z}/{x}/{y}`. Easy to get backwards.

### NZ Active Faults reference layer

- GNS Science's NZ Active Faults Database (1:250,000 scale), ~500 named faults
  merged from ~10,000 digitised segments, flattened from their ArcGIS feature
  service into one static GeoJSON file in `public/data/`.
- **Bundled, not queried live**: the geometry barely changes, and this avoids
  depending on an external service - the same reasoning as the keyless
  basemap.
- **Fetched lazily on first toggle-on**, not at page load. At ~500KB gzipped
  it's heavier than any other asset, and most sessions never turn it on.
- **Off by default** - it's an optional reference layer, not a live hazard,
  so it shouldn't compete with the map's purpose until asked for.
- Declared before the hazard markers in the JSX so MapLibre stacks it
  underneath them.

### Marker paint order

`events` arrives newest-first (App sorts earthquakes that way for the
sidebar). Markers painted later in the DOM sit on top, so the marker list is
reversed at render time - newest marker painted last, hence on top. This is
for stacking only; it doesn't affect the sidebar or anything else.

### Map is locked to north

No drag-rotate, no pitch, and `touchZoomRotate.disableRotation()` on load so
a two-finger twist zooms without rotating. A rotated or tilted hazard map has
no upside here and "which way is north" matters when you're reading distances
and directions off it. The `NavigationControl` compass button is hidden
(`showCompass={false}`) since it would never do anything.

### Re-centres on the user's location, but only on a real move

The map flies to the user's location whenever it's (re)found - the first fix,
a typed address, a fresh "Use my location" fix somewhere new. It keys on
`userLocation`, which is App's `effectiveLocation`, so manual and GPS are
handled the same way. A `RECENTER_THRESHOLD_KM` (250m) gate skips the
metre-scale drift `watchPosition` streams while you hold still, so the map
doesn't creep. Only the first centre also sets the zoom (in from the NZ-wide
default); later re-centres keep whatever zoom the user has set.

---

## Severity scale, colours, alert circles

Ported directly from the original app's `alertCircleColorArray` /
`alertCirlceRadiusArray` (`Disaster Zone/js/api/geoLocationAPI.js`) so the map
reads the way it always has.

### `SEVERITY_LEVELS` stays in ascending order

`volcanoLevelToSeverity` indexes into it positionally by GeoNet's 0-5 alert
level, so the order is load-bearing. Display order (most severe first - now
`extreme` - for the filter row and map key) is a separate reversed constant.

### `extreme` - the seventh tier, and dropping `unnoticeable`

GeoNet's felt-intensity vocabulary is seven words -
`unnoticeable, weak, light, moderate, strong, severe, extreme`. The original
app and the first rebuild only handled the middle five; anything else fell
through to `none` and was then filtered out of the map, the list and the
filter chips with no way to see it - so a genuine `extreme` quake (the most
destructive kind) would have rendered nowhere.

The visible parts (the new filter chip, the map-key legend row, the `#8b1a9c`
palette entry, the recoloured marker icons) went through the mockup-review loop
first - published Artifact, iterated over its comments, approved before any
`src/` change.

- **`extreme` is now a real tier** at the top of `SEVERITY_LEVELS` (index 6).
  It only arises from earthquakes - volcano alert levels stop at 5 - but the
  colour and marker icons exist for every level so the `Record<SeverityLevel,
  …>` maps stay total.
- **Its colour is purple (`#8b1a9c`), not a darker red.** A deeper red muddies
  into `severe` on the dark basemap; the distinct hue keeps "worse than severe"
  legible at a glance. It's *not* in `DARK_TEXT_SEVERITIES` - `#8b1a9c` clears
  4.5:1 against white (~7:1), so the popup badge keeps white text.
- Radius (`SEVERITY_RADIUS_METERS.extreme = 70000`) and proximity-suppression
  distance (`SEVERITY_PROXIMITY_SUPPRESSION_KM.extreme = 57.5`) continue the
  ported ladder. Stylistic, like the rest of these numbers.
- **`unnoticeable`, a missing/blank value, or an unknown word all map to
  `none`.** `earthquakeIntensityToSeverity` never throws (a non-string is
  treated as blank - this is an old, loosely-specified endpoint) and always
  returns a tier; `none` is filtered out of the map, the list, the ranks and
  the toasts, so these quakes are invisible. The event is still *built*,
  though, so its id is in the new-event baseline - a later upward intensity
  revision (GeoNet refines these for a few minutes) won't fire a spurious
  "new" toast. Same treatment as a level-0 volcano.
- **An unrecognised *word* is also logged.** Any non-blank value that isn't one
  of the seven nor `unnoticeable` gets a `console.error` naming the raw value,
  once per distinct value per session, so a new GeoNet vocabulary word (a real
  `extreme`, say, if the scale ever shifts again) surfaces in logs instead of
  silently reading as `none`. `scripts/visual-audit.mjs` keeps that specific
  message out of its zero-console-errors gate but checks the *distinct* count
  stays tiny - a burst means normalisation itself broke.

### The pale colour palette, and dark text on the light three

- The palette went through a round of being darkened for contrast, then was
  **reverted to the original pale colours** by request.
- With the pale palette, white text on the `weak` / `light` / `moderate`
  backgrounds fails WCAG contrast (white on `weak` measured **1.88:1**,
  against a 4.5:1 minimum). `DARK_TEXT_SEVERITIES` in `EventDetailPopup` lists
  those three and gives them dark text; the darker severities read fine in
  white.

### Circle suppression for clustered earthquakes

Showing every alert circle for a swarm of nearby quakes floods the map with
overlapping colour washes and can bury a smaller or older event's marker.
`computeStackedCircleSuppressions` hides an event's circle when a *more
recent* nearby earthquake exists - the newest in a cluster wins and stays
visible; the rest come back on zoom-in or selection (handled by the caller).

- **"Nearby" is real epicenter-to-epicenter distance**
  (`SEVERITY_PROXIMITY_SUPPRESSION_KM`, 20-50km scaled by severity), **not**
  whether the two events' visual alert circles overlap on screen. The visual
  radius scales with a per-hazard multiplier and balloons past 200km for a
  severe quake; using that as the overlap test (as an earlier version did)
  let two unrelated severe quakes at opposite ends of the country suppress
  each other purely because their inflated circles touched.
- Because the threshold is now a genuine ground distance, suppression applies
  at every zoom level, not just zoomed out.
- **Only moderate-and-above earthquakes take part**, on either side of the
  comparison. Below moderate the events are minor enough that just showing
  all of them is fine.
- **Volcanoes are exempt**: a handful of fixed known locations, representing
  an ongoing alert level rather than a discrete timestamped event, so "more
  recent" isn't meaningful. The crowding problem this targets is earthquake
  swarms.

### The radius multipliers are stylistic

`EARTHQUAKE_RADIUS_MULTIPLIER` (4) and `VOLCANO_RADIUS_MULTIPLIER` (10) are
carried over from the original, which multiplied the base radius per hazard
type for visual effect - not a scientific figure.

### Inactive volcanoes are hidden by default

GeoNet reports every monitored volcano, most at Alert Level 0 (no unrest).
By default only level > 0 shows. A "Show inactive volcanoes" map-key toggle
adds the rest as plain grey markers - **map only**, no alert circle, and not
in the Recent Events list, which is a feed of activity rather than an
inventory of cones. All levels are still built into the event list upstream
so the toggle never trips the "new event" detector; `filteredEvents` and a
derived `sidebarEvents` do the hiding. Level-0 volcanoes carry severity
`none`, which sits outside the severity filter chips - the toggle is their
only control.

---

## Event popups

### Illustrative photos, never live imagery

- **Volcano popups** show a bundled Wikimedia Commons photo of the volcano
  itself. GeoNet doesn't expose volcano photos via its API; the nearest
  thing, live crater-cam snapshots, exists for only a couple of volcanoes
  (Ruapehu, Whakaari), with filenames timestamped every 10 minutes and no
  "latest" alias, so it isn't usable from a static frontend with no backend
  proxy. Northland has no entry - it's a diffuse field of small scoria cones
  with no single landmark - and the popup just omits the image.
- **Earthquake popups** show a photo of the *nearest curated town*, not the
  epicenter - GeoNet's felt-quake data has no image field at all. Lookup is
  by nearest locality name against the curated list in
  `constants/cityImages.ts`; a miss silently shows no image, which is the
  common case.
- Full sourcing and licensing methodology lives in the header comments of
  `constants/cityImages.ts`, `constants/volcanoImages.ts` and
  `constants/maoriPlaceNames.ts` - deliberately kept in-file so provenance
  travels with the data.

### Selecting an event pans the marker low, at every viewport

The popup is anchored `bottom` and grows *upward* from its marker, so centring
the marker (which `flyTo` does by default) puts the popup's top - photo and
close button - above `<main>`, where `overflow-hidden` clips it. Selecting an
event therefore flies with `padding.top` (`POPUP_HEADROOM_PX`, 460) so the
marker lands low and the whole popup fits; closing the popup eases the padding
back to 0 so panning and pinch-zoom re-centre normally.

This was mobile-only at first, on the assumption desktop had height to spare.
It doesn't: at 1280x900 the popup was clipped by 38px and its close button was
unreachable. The padding is clamped to the container height so a short window
still shows the marker itself, and `scripts/visual-audit.mjs` asserts the popup
stays inside `<main>` at every viewport.

### Detail icons are drawn near-white

They sit on a dark card. An earlier light-card design flipped them near-black
with an `invert` step; that card and the invert are both gone.

### Volcano "latest bulletins" is an external link

GeoNet's "Latest Volcanic Activity Bulletins" are website content, not part
of their documented API - no JSON or RSS feed backs that page. There's no
per-volcano deep link either: the page's volcano filter is a POST form, not a
URL query param. So the popup links to the general bulletins hub rather than
reproducing bulletin content.

### `!important` on popup styles

`maplibre-gl.css` ships its own border-radius, background, padding, box-shadow
and close-button styling for `.maplibregl-popup-*` as plain unlayered CSS,
which beats any Tailwind utility (Tailwind wraps utilities in `@layer`, and
unlayered rules always win over layered ones regardless of specificity).
Overriding them needs `!`. Same fix is used for the map's zoom control and
attribution link. The class string must also stay on one line - MapLibre
calls `classList.add()` on it internally and that throws on non-space
whitespace.

---

## Layout and accessibility

Several of these came out of axe-core accessibility audits.

### Heading levels on floating panels

The event popup's title and the "can't get your location" card use `<h2>`,
not `<h3>`/`<h4>`. Each floating panel is its own top-level section - a
sibling to the page's other floating panels, not nested under any of them. An
axe-core heading-order audit flagged the page jumping straight from its one
`<h1>` to `<h3>`. The severity key's internal headings follow the same
reasoning (`<h2>` then `<h3>` for the nested "intensity" list).

### `LocationStatus` is a persistent bottom bar

A single-row floating card inset `bottom-2 inset-x-2` (`min-h-12`), always
present. It shows one of: "Finding your location…" (with a spinner) while
geolocation resolves, the address (prefixed with a small "Manual" tag when
overridden), or "Location unavailable - add an address" on denial/error.
**"Change" is always offered** - a typed address overrides even a successful
GPS fix, which is the point for anyone on a VPN whose device location is
wrong; "Use my location" appears only while a manual override is active. The
editor state (input + autocomplete) grows the card above this floor.

- **The address is shown coarse and single-line**: `formatShortAddress` in
  `api/nominatim.ts` reduces Nominatim's response to "Suburb, City" (e.g.
  "City Centre, Auckland"), degrading to region/country for a point at sea.
  The exact address the user types is still geocoded in full - accurate
  distances - it just isn't displayed. `reverseGeocode` and the forward
  lookups all pass `addressdetails=1` and run through the same formatter; the
  autocomplete picker is the one place the full string still shows, so
  near-identical candidates stay distinguishable.
- The map's zoom control and attribution are lifted `bottom-16` (in
  DisasterMap's control CSS) so the bar doesn't cover them. The attribution
  is `compact` so it's just an "i" button, not a strip of text - but note
  `compact` alone only makes it *collapsible*: MapLibre still renders it open,
  so `onLoad` strips `maplibregl-compact-show` to get the collapsed start
  state. Without that, every fresh load showed a strip of credit text and it
  became the "i" only once someone had clicked it.
- The attribution sits bottom-right, exactly where the `>= sm` events rail is,
  and the rail (z-20) buried it completely - from first load on desktop, where
  the rail is open by default. Map credit has to stay reachable, so the
  bottom-right control stack ends short of the rail while it's open.
  `scripts/visual-audit.mjs` asserts the "i" is collapsed, uncovered, and
  still expands on click.
- The manual-entry autocomplete opens **upward** (`bottom-full`) since the
  input sits near the screen edge.
- The mobile Recent Events sheet is `bottom-0` (z-20) and covers the bar when
  open - acceptable, the sheet is the active surface then.
- An earlier version was a small centred pill at `bottom-16 left-20`, offset
  by hand to dodge the attribution and zoom controls; lifting those controls
  instead frees the whole width.

### Map controls and attribution sit inside a landmark

The map region is a `<main>`, not a `<div>`, so MapLibre's own attribution
control is inside a landmark - an axe-core best-practice audit flagged it as
unlandmarked content. The `overflow-hidden` on that container also clips the
events sidebar's off-screen (translated) closed state, which would otherwise
add to the container's scrollable width.

### Touch targets

Interactive controls are sized to a 44x44px minimum (WCAG 2.5.5 / Apple HIG):
the popup close button (small visible glyph, enlarged tap area centred via
flex) and the map markers (invisible padding around a smaller icon).
MapLibre's zoom buttons (default 29px) are 40px on mobile - visually lighter
there - and 44px from `sm:` up.

### Map chrome follows the dark popup palette

The map key and the zoom control are styled to match the event popup card:
`bg-slate-900/95`, `ring-1 ring-white/10`, `shadow-xl`, white text. The zoom
glyphs ship as dark-grey SVGs, so they're forced white with
`brightness-0 invert`; the map-key legend icons (also dark-grey fills) get
the same treatment, which flattens them to clean white silhouettes.

### Events sidebar isn't a modal

No `role="dialog"` / `aria-modal` - an axe-core audit flagged those as
misused here. On tablet/desktop it's a persistent side panel; on mobile it's
a bottom sheet with a backdrop. It behaves as a panel, not a modal dialog.

### Mobile bottom sheet is drag-resizable

The sheet is positioned `absolute` inside `<main>` (not `fixed` to the
viewport), so its height is a percentage of the map area - which makes "full
height" mean "top edge meets the navbar" for free, and lets `overflow-hidden`
on `<main>` clip the closed (translated-down) state. The grip is a
`role="slider"`: drag it (pointer events + capture, `touch-action: none` so
the page doesn't scroll under the finger) or use Arrow/Home/End keys to size
it between a ~210px floor and full height. Height lives in component state as
a percent and survives a close/reopen within the session. At `>= sm` the `sm:`
classes take over and it's a fixed-width rail again; the grip is `sm:hidden`.

A drag can shrink the sheet *below* the floor as a pull-to-close hint;
released under ~130px it calls `onClose()` (then resets the stored height
after the slide-out so it reopens at a sensible size), otherwise it snaps
back to the floor. Keyboard resize never closes - that's a touch gesture.

### Filter chips are deliberately large

Sized up from a smaller, subtler chip design after feedback that the filters
weren't prominent enough. `flex-none` keeps each chip full-size inside the
severity row's horizontal-scroll container rather than letting them shrink or
wrap. The severity row is kept to a single line (severe-to-weak, matching the
map key).

### Severity key: button and panel positioned independently

They each anchor to their own fixed corner (`top-3 right-3` /
`top-16 right-3`) rather than sharing one `absolute` wrapper. With a shared
wrapper sized to whichever child was widest, the button visibly shifted
sideways whenever the panel toggled. The key is also minimised by default at
every breakpoint (it previously stayed permanently expanded on tablet/desktop
with no way to collapse it).

The key does **not** move when the events sidebar opens - it stays in its
corner and the sidebar (`z-20`) covers it (`z-5`). An earlier version slid
the key left to stay clear of the open sidebar; that read as the key
"following" the panel around, so it now just sits underneath.

### User location marker is visually distinct

A circular compass-style icon, versus the teardrop hazard pins, so "where you
are" never reads as another event.

### Fire / flood / hurricane / tornado left out of the key

They aren't wired to real data yet (they were placeholder-only in the
original too), so they're omitted from the severity key for now.

---

## Data sources

### GeoNet, polled once a minute

Felt-earthquake and volcano-alert-level data from GeoNet's public API
(`api.geonet.org.nz`, no key). GeoNet publishes on its own schedule; the
original app's few-second `setInterval` just wasted requests. A minute is
plenty responsive.

### OSM Nominatim for geocoding, rate-limited

Reverse geocoding (coords -> address) and forward/autocomplete (address ->
coords) via `nominatim.openstreetmap.org`. Their usage policy caps this at
~1 request/second, so:

- Reverse geocode coordinates are rounded to ~100m before use, so small GPS
  jitter reuses the cached query instead of re-hitting the endpoint every
  tick.
- The address search box debounces (300ms) and requires 3+ characters rather
  than firing per keystroke. A debounce only fires once typing pauses, so this
  stays well inside the policy.
- Suggestions are stored tagged with the query that produced them and are only
  rendered when that tag matches the current input, so a slower response for an
  earlier query can never be shown as an answer to the current one. Until this
  query's own results land the dropdown simply isn't rendered - no spinner, no
  "searching" row, and never the previous query's addresses.
- Forward geocoding is biased to NZ (`countrycodes=nz`) since a bare street
  name is otherwise ambiguous worldwide.

### Bundled NZ localities for "nearest town"

`data/nzLocalities.ts` is a hand-picked set of ~65 towns/cities for offline
nearest-town lookups - no geocoding API, no rate limits, resolves every event
at once instantly. Not exhaustive; aims for reasonable regional coverage
across both islands, including sparsely-populated regions so distant events
still resolve to something honest.

### Time display

- Quake times are shown fixed to NZ time (`Pacific/Auckland` IANA zone, so
  NZST/NZDT switch automatically) regardless of the viewer's device - this is
  an NZ disaster app, so a quake's time shouldn't shift with where the reader
  happens to be.
- The one thing that *does* follow the viewer's device is 12h vs 24h: there's
  no direct "is this device 24-hour" API, but the browser's default-locale
  formatter already reflects that OS setting, so its `hourCycle` is borrowed.
  (Requested behaviour.)
- Relative time ("12 min ago") is used for the first 24 hours, then an
  absolute date/time - relative time answers "did I just feel that" but gets
  vague for older lookups.

### `localStorage` conveniences swallow errors

`lib/browserStorage.ts` wraps `localStorage` and swallows every failure
(private browsing, quota, disabled storage). These are "remember this for
next time" conveniences - the last GPS fix, a manually entered address - and
losing one isn't worth surfacing an error.

### Manual address entry is sticky

Once a user types an address, it isn't silently overridden if geolocation
later succeeds - they made a deliberate choice. It persists across reloads
and only clears when they explicitly clear it.

The "Use my location" menu item is that explicit clear, but it only drops the
typed address once a fresh fix actually lands. If the geolocation request
fails (denied, timeout, insecure context), the typed address stays - falling
back to "no address" would punish the user for trying.

### The initial location watch has a client-side timeout

`useGeolocation` arms a `GEOLOCATION_TIMEOUT_MS` (40s) timer alongside the mount
`watchPosition`. `PositionOptions.timeout` (20s) only counts once a request is
genuinely in flight; it does nothing while the permission prompt sits
unanswered, and some engines (Firefox under Playwright, notably) invoke
*neither* callback in that state, leaving the bar on "Finding your location…"
with no way out. The backstop writes a code-3 error *only if still loading* (a
result landing in the same tick wins); the first watch callback
(`applyPosition` / `applyError`) cancels it, so once the watch is working it
can never fire.

`requestLocation` ("Use my location") is deliberately *not* backstopped -
`getCurrentPosition` honours its own `timeout`, so a stalled one-shot lands in
the error callback (code 3) by itself, and layering a second timer over the
same `loading` flag / ambient watch produced a string of new edge cases each
time it was tried. The one residual: if a user taps "Use my location" while the
initial permission prompt is *still unanswered* and then never answers it, the
mount backstop still surfaces an error but `LocationStatus`'s spinner stays
until `getCurrentPosition` calls back - which it does the moment the prompt is
answered. A permanently-ignored prompt is out of scope.

Accepted trade-off: a genuine fix that takes longer than 40s (a very cold GPS
acquire after a slowly-answered prompt) shows "Location request timed out"
briefly before it lands and self-heals.

`scripts/visual-audit.mjs` exercises the backstop: a `geo: 'hang'` context
stubs geolocation to never call back and sets `window.__dzGeoTimeoutMs` (the
only non-production reader of that global) to shrink the 40s to 1.5s, then
asserts the bar leaves "Finding your location…" for an error state with an "add
an address" affordance.

### "New" vs "latest" are two separate ideas

- **New** = arrived while *this* browser tab was open (a ping on the marker, a
  "New" badge in the list, a toast). Nothing is "new" on a fresh load.
- **Latest** = the newest felt quakes right now, regardless of when you
  loaded - the 5 most recent with an origin time in the last 48h (fewer, or
  none, in a quiet spell). Shown as a numbered badge `1..5` on the marker and
  the list row, with an "older" divider beneath the last ranked row.

They coexist: a row can be both `#1` and `New`. The 48h cap keeps a stale
quake from being called "latest" just because nothing newer exists; a
once-a-minute clock tick ages quakes out of the window without needing fresh
data. Ranks are computed from `filteredEvents`, so they track the severity/
kind filters - hide "weak" quakes and the numbering is of what's left.

### "New event" tracking waits for both queries

Earthquakes and volcanoes are independent queries that resolve at different
times. Seeding the "seen on first load" baseline off whichever responds first
would wrongly flag the other's data as new the moment it arrives. Seeding is
gated on both having resolved at least once, not on the combined list merely
being non-empty. Filtering is applied *after* new-event tracking sees the
full list, so hiding an event and un-hiding it doesn't make it reappear as
"new".

The toast queue stores a snapshot of each event as it arrived, but renders
each one re-resolved against the live list. GeoNet refines a quake's felt
intensity and magnitude for a few minutes afterwards; without the re-resolve
the toast could show a green "light" icon while the same quake's map marker
had already updated to "weak".

### `?demoNewEvent=1`

Injects one fake client-side earthquake a few seconds after load (never
touches real GeoNet data) so the new-event toast/pulse/badge can be
demonstrated without waiting for a real quake.

---

## Relationship to the 2016-2018 original

The original source is on the `gh-pages` branch and the `legacy-v1` tag.
Where current modules deliberately mirror it, the mapping is:

| Now | Original |
|---|---|
| `constants/severity.ts` | `alertCircleColorArray` / `alertCirlceRadiusArray` in `js/api/geoLocationAPI.js` |
| `hooks/useGeolocation.ts` | `geoLocateUser` / `geolocationSuccess` / `geolocationError` in `js/api/geoLocationAPI.js` |
| `lib/geoCircle.ts` | `google.maps.Circle` (radius in metres) |
| volcano filter in `App.tsx` | `VolcanoSortLoop` (only volcanoes with active unrest) |

Not yet ported: the original's fire/flood/hurricane/tornado placeholder
events, which were never wired to real data there either.
