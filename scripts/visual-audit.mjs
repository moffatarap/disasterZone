/**
 * Exhaustive visual + behavioural audit, run after any UI change (see
 * CLAUDE.md). Drives the real app in a real browser at three viewports, walks
 * the user flows, and asserts the features docs/DECISIONS.md says must be there.
 *
 *   npm run dev                                    # in another terminal
 *   node scripts/visual-audit.mjs [baseURL] [--browser=chromium|firefox|all]
 *
 * Both engines run by default - a clipped popup or an unreachable control can
 * show up in one and not the other. Screenshots land in .audit/<engine>/
 * (gitignored). Exits non-zero if any check fails in any engine.
 */
import { chromium, firefox } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'

const ENGINES = { chromium, firefox }

// First non-flag arg is the base URL; a scheme is added if omitted, since
// page.goto() requires one (`localhost:3000` -> `https://localhost:3000`).
const rawBase = process.argv.slice(2).find((a) => !a.startsWith('--'))
const BASE = rawBase
  ? /^https?:\/\//.test(rawBase)
    ? rawBase
    : `https://${rawBase}`
  : 'https://localhost:8080/'
const browserArg =
  process.argv.slice(2).find((a) => a.startsWith('--browser='))?.split('=')[1] ?? 'all'
const selectedEngines =
  browserArg === 'all' ? Object.keys(ENGINES) : browserArg.split(',').map((s) => s.trim())
for (const name of selectedEngines) {
  // Object.hasOwn, not `ENGINES[name]` - the latter is truthy for inherited
  // keys like `toString`, which would slip past this and crash later.
  if (!Object.hasOwn(ENGINES, name)) {
    console.error(`unknown --browser value: ${name} (expected chromium, firefox, or all)`)
    process.exit(2)
  }
}

const OUT_ROOT = '.audit'
const WELLINGTON = { latitude: -41.29, longitude: 174.78 }
const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  tablet: { width: 800, height: 900 },
  mobile: { width: 390, height: 844 },
}

rmSync(OUT_ROOT, { recursive: true, force: true })

const results = []
// Per-engine binding, set by the runner loop below. `open`/`shot`/`check` close
// over these so the existing flow blocks don't each have to thread an engine
// argument through.
let browser
let engine
let OUT
let consoleErrors = []
// Intentional diagnostics for an unmapped GeoNet intensity word - kept out of
// the hard console gate (live-data-driven, not a UI regression); the distinct
// count is checked at the end of each engine's runSuite() instead.
let intensityDiagnostics = []

const check = (name, ok, detail = '') => {
  results.push({ name: `[${engine}] ${name}`, ok: !!ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${engine}] ${name}${detail ? `  -- ${detail}` : ''}`)
}

// Contexts open()ed during the current flow. Drained (and closed) at the end of
// every step(), so a flow that throws before its own ctx.close() doesn't leak a
// live BrowserContext - tile downloads and timers left running would make the
// later timing-based waits flakier.
const openContexts = []

// One isolated flow. A throw here (a Firefox-only selector timeout, say) is
// recorded as a failed check for that flow and the remaining flows still run -
// "exhaustive, not a spot check" (CLAUDE.md).
async function step(label, fn) {
  try {
    await fn()
  } catch (err) {
    check(`flow "${label}" ran to completion`, false, String(err?.message ?? err).split('\n')[0].slice(0, 160))
  } finally {
    for (const ctx of openContexts.splice(0)) {
      await ctx.close().catch(() => {})
    }
  }
}

// `geo`: true = grant permission at WELLINGTON; false = stub a denial;
// 'hang' = stub geolocation that never calls back, plus shrink the app's
// client-side timeout so the backstop can be observed without a 40s wait.
async function open(vp, { geo = true, query = '' } = {}) {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: VIEWPORTS[vp],
    // Firefox ignores `isMobile` (Playwright resolves it, but with no
    // devicePixelRatio / viewport-meta emulation); the mobile *layout* comes
    // from viewport width (Tailwind's `sm:` breakpoint) regardless.
    isMobile: vp === 'mobile',
    hasTouch: vp === 'mobile',
    ...(geo === true ? { permissions: ['geolocation'], geolocation: WELLINGTON } : {}),
  })
  if (geo === false) {
    // Deterministic "user blocked the prompt" in every engine. Chromium fires
    // PERMISSION_DENIED promptly when no permission is granted, but Playwright's
    // Firefox invokes neither callback in that state, so stub the API to deny -
    // the app then sees exactly the GeolocationPositionError a real block emits.
    await ctx.addInitScript(() => {
      const denied = { code: 1, message: 'User denied Geolocation', PERMISSION_DENIED: 1 }
      const reject = (_onOk, onErr) => {
        if (onErr) setTimeout(() => onErr(denied), 0)
      }
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition: reject,
          watchPosition: (onOk, onErr) => {
            reject(onOk, onErr)
            return 0
          },
          clearWatch: () => {},
        },
      })
    })
  } else if (geo === 'hang') {
    // Reproduce the "engine never calls back" pathology (Firefox under
    // automation with no permission granted) and let useGeolocation's backstop
    // fire fast, so the audit can assert it resolves to an actionable state.
    await ctx.addInitScript(() => {
      window.__dzGeoTimeoutMs = 1500
      const noop = () => {}
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: { getCurrentPosition: noop, watchPosition: () => 0, clearWatch: noop },
      })
    })
  }
  openContexts.push(ctx)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => consoleErrors.push(`[${engine}/${vp}] pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const text = m.text()
    // Intentional diagnostic for a new/unmapped GeoNet intensity word - real,
    // but driven by live upstream data, not a UI regression (see severity.ts).
    if (/Unrecognised GeoNet earthquake intensity/.test(text)) {
      intensityDiagnostics.push(`[${engine}/${vp}] ${text}`)
      return
    }
    consoleErrors.push(`[${engine}/${vp}] ${text}`)
  })
  // 'load', not 'networkidle': a map app streams tiles and polls on a timer, so
  // it may never hit a network-idle window, and Playwright advises against it.
  // The explicit settle below is what the flows actually rely on.
  await page.goto(BASE + query, { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  return { ctx, page }
}

const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })

/** Selects an event and returns true if one was available.
 *
 *  Goes through the Recent Events list rather than hunting for a marker: once
 *  the map centres on the user at zoom 9 there may be no pin on screen at all,
 *  and marker DOM order says nothing about what's visible. Picking from the
 *  list is a real user path and always resolves to a selectable event. */
async function selectFirstEvent(page) {
  const row = page
    .locator('aside[aria-label="Recent events"] button')
    .filter({ hasText: /Magnitude/ })
    .first()
  if ((await row.count()) === 0) return false
  await row.click()
  return true
}
const bar = (page) => page.locator('div.absolute.bottom-2').first()
const changeBtn = (page) => page.getByRole('button', { name: /^(Change|Set address)$/ })

async function runSuite() {
  // ---------------------------------------------------------------- structure
  await step('structure', async () => {
    const { ctx, page } = await open('desktop')
    await shot(page, 'desktop-01-initial')

    check('exactly one <h1>', (await page.locator('h1').count()) === 1)
    check(
      'map region is a <main> landmark containing the attribution',
      (await page.locator('main .maplibregl-ctrl-attrib').count()) === 1,
    )
    check(
      'attribution is compact (an "i" button, not a text strip)',
      (await page.locator('.maplibregl-ctrl-attrib.maplibregl-compact').count()) === 1,
    )
    // `compact` alone only makes it collapsible; MapLibre still renders it open,
    // so assert the collapsed start state, and that the toggle still works.
    check(
      'attribution starts collapsed, not expanded over the map',
      (await page.locator('.maplibregl-ctrl-attrib.maplibregl-compact-show').count()) === 0,
    )
    // The map credit must stay reachable, so assert nothing is painted over it -
    // the events rail buried it completely at >= sm.
    const attribTop = await page.evaluate(() => {
      const el = document.querySelector('.maplibregl-ctrl-attrib-button')
      if (!el) return 'missing'
      const r = el.getBoundingClientRect()
      return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.className ?? 'none'
    })
    check('attribution "i" is not covered by other chrome', /maplibregl-ctrl-attrib/.test(String(attribTop)),
      String(attribTop).slice(0, 60))
    await page.locator('.maplibregl-ctrl-attrib-button').first().click()
    await page.waitForTimeout(300)
    check(
      'attribution still expands when its "i" is clicked',
      (await page.locator('.maplibregl-ctrl-attrib.maplibregl-compact-show').count()) === 1,
    )
    check(
      'no compass control (map is locked to north)',
      (await page.locator('.maplibregl-ctrl-compass').count()) === 0,
    )
    check(
      'events panel is not a modal (no dialog role / aria-modal)',
      (await page.locator('aside[role="dialog"], aside[aria-modal]').count()) === 0,
    )
    check('events panel is an <aside> landmark', (await page.locator('aside[aria-label="Recent events"]').count()) === 1)
    check('location bar is present with a Change control', (await changeBtn(page).count()) === 1)

    // The seventh intensity tier - a genuine `extreme` quake used to fall
    // through to `none` and render nowhere (see docs/DECISIONS.md).
    check(
      'severity filter offers an extreme chip',
      (await page.getByRole('button', { name: /^extreme$/i }).count()) === 1,
    )

    // Severity key: minimised by default, and its contents. The events rail
    // (z-20) deliberately covers the key (z-5), so close it first.
    await page.getByRole('button', { name: 'Close recent events' }).click()
    await page.waitForTimeout(500)
    const keyToggle = page.getByRole('button', { name: 'Toggle map key' })
    check('map key toggle exists', (await keyToggle.count()) === 1)
    await keyToggle.click()
    await page.waitForTimeout(300)
    // Scoped to the key panel itself. Reading document.body here would let event
    // titles satisfy these - "New Plymouth" alone breaks the hazard assertion.
    const keyPanel = page.locator('main div').filter({ has: page.locator('h2', { hasText: 'KEY' }) }).last()
    check('map key panel opens', await keyPanel.isVisible())
    const keyText = await keyPanel.innerText()
    check('map key offers the fault-lines toggle', /fault/i.test(keyText))
    check('map key offers the inactive-volcanoes toggle', /inactive volcano/i.test(keyText))
    check('map key lists the extreme intensity tier', /\bextreme\b/i.test(keyText))
    check(
      'unported hazards stay out of the key (fire/flood/hurricane/tornado)',
      !/\b(fire|flood|hurricane|tornado)\b/i.test(keyText),
    )
    await shot(page, 'desktop-02-map-key')
    await keyToggle.click()

    // Zoom buttons: 44px from sm: up.
    const zoom = page.locator('.maplibregl-ctrl-group button').first()
    const zb = await zoom.boundingBox()
    check('zoom button is a 44px target at >= sm', zb && Math.round(zb.height) === 44, `${zb && zb.height}px`)
    await ctx.close()
  })

  // ------------------------------------------------------- flow: manual address
  await step('manual address', async () => {
    const { ctx, page } = await open('desktop')
    const initial = (await bar(page).innerText()).trim()
    check('GPS fix resolves to an address in the bar', !/unavailable|No location|denied/i.test(initial), initial)
    check(
      'GPS source shows the crosshair icon',
      (await page.locator('svg > title', { hasText: 'Address from your device location' }).count()) === 1,
    )

    await changeBtn(page).click()
    await page.waitForTimeout(250)
    const items = await page.getByRole('menuitem').allInnerTexts()
    check('Change opens a two-item menu', items.length === 2, items.join(' / '))
    await shot(page, 'desktop-03-menu')

    await page.getByRole('menuitem', { name: 'Enter address' }).click()
    await page.getByLabel('Address').fill('cuba street wellington')
    await page.waitForTimeout(2000)
    const sugg = page.locator('ul li button')
    const n = await sugg.count()
    check('suggestions appear for a 3+ character query', n > 0, `${n} rows`)
    const clamp = await sugg.first().locator('span').evaluate((el) => getComputedStyle(el).webkitLineClamp)
    check('suggestion rows clamp to two lines', clamp === '2', `line-clamp: ${clamp}`)
    await shot(page, 'desktop-04-suggestions')

    await sugg.first().click()
    await page.waitForTimeout(2000)
    check(
      'a typed address switches the icon to the pin',
      (await page.locator('svg > title', { hasText: 'Address you entered' }).count()) === 1,
    )
    const manualText = (await bar(page).innerText()).trim()
    check('bar shows the chosen address', manualText.length > 0 && !/No location/i.test(manualText), manualText)
    await shot(page, 'desktop-05-manual-address')
    await ctx.close()
  })

  // ------------------------------------- flow: denied location keeps the address
  await step('denied location', async () => {
    const { ctx, page } = await open('desktop', { geo: false })
    const denied = (await bar(page).innerText()).trim()
    check('denied geolocation is reported in the bar', /denied|unavailable|HTTPS/i.test(denied), denied)

    await changeBtn(page).click()
    await page.getByRole('menuitem', { name: 'Enter address' }).click()
    await page.getByLabel('Address').fill('Wellington')
    await page.waitForTimeout(1600)
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.waitForTimeout(2500)
    const withAddress = (await bar(page).innerText()).trim()

    await changeBtn(page).click()
    await page.getByRole('menuitem', { name: 'Use my location' }).click()
    await page.waitForTimeout(600)
    const failing = (await bar(page).innerText()).trim()
    check('a failed "Use my location" reports why', /denied|unavailable|HTTPS|Could not/i.test(failing), failing)
    await shot(page, 'desktop-06-location-failed')
    await page.waitForTimeout(5400)
    const after = (await bar(page).innerText()).trim()
    check('…then hands the typed address back', after.split('\n')[0] === withAddress.split('\n')[0], after)
    await ctx.close()
  })

  // ------------------- flow: a hung geolocation times out to an actionable state
  // docs/DECISIONS.md - "Any pending geolocation has a client-side timeout".
  await step('geolocation timeout', async () => {
    // geo:'hang' stubs geolocation to never call back and sets
    // window.__dzGeoTimeoutMs = 1500; open() already waits 2500ms, so the
    // backstop has fired by now.
    const { ctx, page } = await open('desktop', { geo: 'hang' })
    const text = (await bar(page).innerText()).trim()
    check(
      'a hung geolocation falls through to an error + "add an address"',
      /timed out|unavailable|add an address/i.test(text) && !/Finding your location/i.test(text),
      text,
    )
    check(
      'the finding-your-location spinner is gone after the timeout',
      (await page.locator('.animate-spin').count()) === 0,
    )
    await shot(page, 'desktop-12-geo-timeout')
    await ctx.close()
  })

  // --------------------------------------------------------- flow: event popup
  for (const vp of ['desktop', 'mobile']) {
   await step(`event popup (${vp})`, async () => {
    const { ctx, page } = await open(vp)
    if (vp === 'mobile') {
      await page.getByRole('button', { name: 'Show and hide the list of recent events' }).click()
      await page.waitForTimeout(600)
    }
    if (!(await selectFirstEvent(page))) {
      console.log(`SKIP  [${engine}/${vp}] GeoNet feed is empty - no event to open`)
      await ctx.close()
      return
    }
    await page.waitForTimeout(2600)
    const popup = page.locator('.maplibregl-popup-content')
    check(`[${vp}] selecting an event opens its popup`, (await popup.count()) === 1)
    const text = await popup.innerText()
    check(`[${vp}] popup shows a magnitude`, /Magnitude/i.test(text))
    check(`[${vp}] popup shows a depth`, /Depth/i.test(text))
    check(`[${vp}] popup shows the GeoNet event id`, /Event ID/i.test(text))
    check(`[${vp}] popup shows distance from the user`, /from you/i.test(text))
    check(`[${vp}] popup title uses <h2>`, (await popup.locator('h2').count()) === 1)

    const closeBtn = page.locator('.maplibregl-popup-close-button')
    const cb = await closeBtn.boundingBox()
    check(`[${vp}] popup close button is a 44px target`, cb && cb.width >= 44 && cb.height >= 44,
      cb && `${Math.round(cb.width)}x${Math.round(cb.height)}`)

    const pb = await popup.boundingBox()
    const mb = await page.locator('main').boundingBox()
    check(`[${vp}] popup is fully on screen (top edge below the navbar)`, pb && mb && pb.y >= mb.y - 1,
      pb && mb && `popup top ${Math.round(pb.y)} vs main top ${Math.round(mb.y)}`)
    await shot(page, `${vp}-07-popup`)

    try {
      await closeBtn.click({ timeout: 5000 })
      await page.waitForTimeout(400)
      check(`[${vp}] popup closes via its ✕`, (await page.locator('.maplibregl-popup-content').count()) === 0)
    } catch {
      check(`[${vp}] popup closes via its ✕`, false, 'close button not clickable (clipped off-screen?)')
    }
    await ctx.close()
   })
  }

  // ------------------------------------------------ flow: recent events + filters
  await step('recent events + filters', async () => {
    const { ctx, page } = await open('desktop')
    const aside = page.locator('aside[aria-label="Recent events"]')
    const listText = await aside.innerText()
    const before = await page.locator('img[alt^="earthquake"]').count()

    // GeoNet's felt feed can legitimately be empty in a quiet spell (see
    // docs/DECISIONS.md), so these assert only against data that is actually
    // present rather than failing the whole run for want of an earthquake.
    if (before === 0) {
      console.log(`SKIP  [${engine}] no live earthquakes right now - list and filter checks skipped`)
    } else {
      check('recent events lists ranked quakes', /\bMagnitude\b/.test(listText))
      if (/OLDER/i.test(listText)) check('recent events separates older entries', true)
      else console.log(`SKIP  [${engine}] fewer than 6 quakes in the feed - no OLDER divider to check`)

      await page.getByRole('button', { name: /^Earthquake$/ }).click()
      await page.waitForTimeout(600)
      const after = await page.locator('img[alt^="earthquake"]').count()
      check('a kind filter hides those markers', after < before, `${before} -> ${after}`)
      await shot(page, 'desktop-08-filtered')
      await page.getByRole('button', { name: /^Earthquake$/ }).click()
      await page.waitForTimeout(600)
      check('un-filtering brings them back', (await page.locator('img[alt^="earthquake"]').count()) === before)
    }
    await ctx.close()
  })

  // --------------------------------------------------------- flow: new-event toast
  for (const vp of ['desktop', 'mobile']) {
   await step(`new-event toast (${vp})`, async () => {
    const { ctx, page } = await open(vp, { query: '?demoNewEvent=1' })
    await page.waitForTimeout(3000)
    const toast = page.locator('[role="status"]')
    check(`[${vp}] demo query raises a new-event toast`, (await toast.count()) >= 1)
    // Scoped to the badge element: /NEW/i over the body matches the locality
    // "New Plymouth", so that check could never fail.
    const badge = page.locator('aside[aria-label="Recent events"] span', { hasText: /^New$/ })
    check(`[${vp}] the new event is badged in the list`, (await badge.count()) >= 1)
    await shot(page, `${vp}-09-toast`)

    const tb = await toast.first().boundingBox()
    if (vp === 'desktop') {
      const railX = (await page.locator('aside[aria-label="Recent events"]').boundingBox())?.x ?? Infinity
      check('[desktop] toast stays clear of the events rail', tb && tb.x + tb.width <= railX + 1,
        tb && `toast right ${Math.round(tb.x + tb.width)} vs rail ${Math.round(railX)}`)
    }
    await page.getByRole('button', { name: 'Dismiss notification' }).first().click()
    await page.waitForTimeout(500)
    check(`[${vp}] toast can be dismissed`, (await page.locator('[role="status"]').count()) === 0)
    await ctx.close()
   })
  }

  // ------------------------------------------------------- mobile bottom sheet
  await step('mobile bottom sheet', async () => {
    const { ctx, page } = await open('mobile')
    await page.getByRole('button', { name: 'Show and hide the list of recent events' }).click()
    await page.waitForTimeout(600)
    const grip = page.getByRole('slider', { name: 'Resize recent events panel' })
    check('[mobile] the sheet has a resize grip', (await grip.isVisible()))
    const startPct = await grip.getAttribute('aria-valuenow')
    await grip.focus()
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(300)
    const grownPct = await grip.getAttribute('aria-valuenow')
    check('[mobile] the sheet resizes by keyboard', Number(grownPct) > Number(startPct), `${startPct} -> ${grownPct}`)
    await shot(page, 'mobile-10-sheet')
    await ctx.close()
  })

  // ------------------------------------------------------------------- tablet
  await step('tablet', async () => {
    const { ctx, page } = await open('tablet')
    await shot(page, 'tablet-11-initial')
    const aside = page.locator('aside[aria-label="Recent events"]')
    const box = await aside.boundingBox()
    check('[tablet] events panel starts closed (off-screen)', !box || box.x >= VIEWPORTS.tablet.width - 1,
      box && `x=${Math.round(box.x)}`)
    check('[tablet] location bar spans the width when the panel is closed',
      (await bar(page).boundingBox())?.width > VIEWPORTS.tablet.width * 0.9)
    await ctx.close()
  })

  check('no console or page errors across the run', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '))
  // Count *distinct* messages, not raw hits: severity.ts dedupes per JS realm and
  // each flow opens a fresh context, so one genuinely-new GeoNet word shows up
  // many times. More than a couple of *distinct* ones means normalisation broke
  // and real quakes are being dropped.
  const distinctDiagnostics = new Set(intensityDiagnostics.map((s) => s.replace(/^\[[^\]]+\]\s*/, '')))
  check('unmapped-intensity diagnostics stay rare', distinctDiagnostics.size <= 2,
    `${distinctDiagnostics.size}: ${[...distinctDiagnostics].slice(0, 3).join(' | ')}`)
}

// Engines run one after another, not in parallel: they share the module-level
// `browser`/`engine`/`OUT`/`consoleErrors`/`intensityDiagnostics` bindings, and on a single dev machine
// two headless browsers contending for CPU make the timing-based waits flakier.
// A ~2x wall-clock audit that's reliable beats a fast one that isn't.
for (const name of selectedEngines) {
  engine = name
  OUT = `${OUT_ROOT}/${name}`
  consoleErrors = []
  intensityDiagnostics = []
  mkdirSync(OUT, { recursive: true })
  console.log(`\n======== ${name} ========`)
  browser = undefined
  try {
    // .launch() is inside the try too: a missing browser binary (run
    // `npx playwright install`) should be a recorded failure for this engine,
    // not an unhandled throw that skips the summary and the other engine.
    browser = await ENGINES[name].launch()
    await runSuite()
  } catch (err) {
    check('suite ran to completion without throwing', false, String(err?.stack ?? err).split('\n').slice(0, 3).join(' '))
  } finally {
    await browser?.close()
  }
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length) {
  console.log('FAILED:\n' + failed.map((f) => `  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`).join('\n'))
  process.exit(1)
}
