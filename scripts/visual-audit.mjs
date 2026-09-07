/**
 * Exhaustive visual + behavioural audit, run after any UI change (see
 * CLAUDE.md). Drives the real app in Chromium at three viewports, walks the
 * user flows, and asserts the features docs/DECISIONS.md says must be there.
 *
 *   npm run dev            # in another terminal
 *   node scripts/visual-audit.mjs [baseURL]
 *
 * Screenshots land in .audit/ (gitignored). Exits non-zero on any failure.
 */
import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'

const BASE = process.argv[2] ?? 'https://localhost:8080/'
const OUT = '.audit'
const WELLINGTON = { latitude: -41.29, longitude: 174.78 }
const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  tablet: { width: 800, height: 900 },
  mobile: { width: 390, height: 844 },
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -- ${detail}` : ''}`)
}

const browser = await chromium.launch()
const consoleErrors = []

async function open(vp, { geo = true, query = '' } = {}) {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: VIEWPORTS[vp],
    isMobile: vp === 'mobile',
    hasTouch: vp === 'mobile',
    ...(geo ? { permissions: ['geolocation'], geolocation: WELLINGTON } : {}),
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => consoleErrors.push(`[${vp}] pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`[${vp}] ${m.text()}`)
  })
  await page.goto(BASE + query, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  return { ctx, page }
}

const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
const bar = (page) => page.locator('div.absolute.bottom-2').first()
const changeBtn = (page) => page.getByRole('button', { name: /^(Change|Set address)$/ })

// ---------------------------------------------------------------- structure
{
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

  // Severity key: minimised by default, and its contents. The events rail
  // (z-20) deliberately covers the key (z-5), so close it first.
  await page.getByRole('button', { name: 'Close recent events' }).click()
  await page.waitForTimeout(500)
  const keyToggle = page.getByRole('button', { name: 'Toggle map key' })
  check('map key toggle exists', (await keyToggle.count()) === 1)
  await keyToggle.click()
  await page.waitForTimeout(300)
  const keyText = await page.locator('body').innerText()
  check('map key offers the fault-lines toggle', /fault/i.test(keyText))
  check('map key offers the inactive-volcanoes toggle', /inactive volcano/i.test(keyText))
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
}

// ------------------------------------------------------- flow: manual address
{
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
}

// ------------------------------------- flow: denied location keeps the address
{
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
}

// --------------------------------------------------------- flow: event popup
for (const vp of ['desktop', 'mobile']) {
  const { ctx, page } = await open(vp)
  const marker = page.locator('img[alt^="earthquake"]').first()
  await marker.click()
  await page.waitForTimeout(2600)
  const popup = page.locator('.maplibregl-popup-content')
  check(`[${vp}] clicking a marker opens the event popup`, (await popup.count()) === 1)
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
}

// ------------------------------------------------ flow: recent events + filters
{
  const { ctx, page } = await open('desktop')
  const aside = page.locator('aside[aria-label="Recent events"]')
  const listText = await aside.innerText()
  check('recent events lists ranked quakes', /\bMagnitude\b/.test(listText))
  check('recent events separates older entries', /OLDER/i.test(listText))

  const before = await page.locator('img[alt^="earthquake"]').count()
  await page.getByRole('button', { name: /^Earthquake$/ }).click()
  await page.waitForTimeout(600)
  const after = await page.locator('img[alt^="earthquake"]').count()
  check('a kind filter hides those markers', after < before, `${before} -> ${after}`)
  await shot(page, 'desktop-08-filtered')
  await page.getByRole('button', { name: /^Earthquake$/ }).click()
  await page.waitForTimeout(600)
  check('un-filtering brings them back', (await page.locator('img[alt^="earthquake"]').count()) === before)
  await ctx.close()
}

// --------------------------------------------------------- flow: new-event toast
for (const vp of ['desktop', 'mobile']) {
  const { ctx, page } = await open(vp, { query: '?demoNewEvent=1' })
  await page.waitForTimeout(3000)
  const toast = page.locator('[role="status"]')
  check(`[${vp}] demo query raises a new-event toast`, (await toast.count()) >= 1)
  check(`[${vp}] the new event is badged in the list`, /NEW/i.test(await page.locator('body').innerText()))
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
}

// ------------------------------------------------------- mobile bottom sheet
{
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
}

// ------------------------------------------------------------------- tablet
{
  const { ctx, page } = await open('tablet')
  await shot(page, 'tablet-11-initial')
  const aside = page.locator('aside[aria-label="Recent events"]')
  const box = await aside.boundingBox()
  check('[tablet] events panel starts closed (off-screen)', !box || box.x >= VIEWPORTS.tablet.width - 1,
    box && `x=${Math.round(box.x)}`)
  check('[tablet] location bar spans the width when the panel is closed',
    (await bar(page).boundingBox())?.width > VIEWPORTS.tablet.width * 0.9)
  await ctx.close()
}

check('no console or page errors across the run', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '))

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length) {
  console.log('FAILED:\n' + failed.map((f) => `  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`).join('\n'))
  process.exit(1)
}
