// screenshot.js — the verification mechanism (AWWWARDS-STANDARD, Rule 1).
// Launches the dev server, captures a full-page screenshot with Playwright, tears
// the server down. Self-contained so it never depends on a session-managed server.
//
//   node screenshot.js                → screenshots/latest.png   (full page, 1440w)
//   node screenshot.js --mobile       → also screenshots/latest-mobile.png (390w)
//   node screenshot.js --path=/tour   → capture a specific route instead of /
//   node screenshot.js --delay=800    → viewport shot N ms after load (catch intro
//                                       motion mid-flight; skips settle + scroll)
//   node screenshot.js --scroll=2400  → settle, scroll to Y px, viewport shot
//                                       (verify pinned/scrubbed states)
//   node screenshot.js --mouse=x,y    → move mouse there before the shot
//                                       (verify hover states; combines with --scroll)

const { chromium } = require('playwright')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')

const PORT = 3123
const ROUTE = (process.argv.find((a) => a.startsWith('--path=')) || '--path=/').slice(7)
const BASE = `http://localhost:${PORT}`
const OUT = path.join(__dirname, 'screenshots')
const MOBILE = process.argv.includes('--mobile')
const DELAY = Number((process.argv.find((a) => a.startsWith('--delay=')) || '').slice(8)) || 0
const SCROLL = Number((process.argv.find((a) => a.startsWith('--scroll=')) || '').slice(9)) || 0
const MOUSE = ((process.argv.find((a) => a.startsWith('--mouse=')) || '').slice(8) || '')
  .split(',')
  .map(Number)

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

function waitForServer(url, timeout = 90000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const ping = () =>
      http
        .get(url, (res) => (res.statusCode < 500 ? resolve() : setTimeout(ping, 500)))
        .on('error', () =>
          Date.now() - start > timeout ? reject(new Error('server timeout')) : setTimeout(ping, 500),
        )
    ping()
  })
}

async function shoot(browser, width, height, file) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  if (DELAY) {
    // mid-flight capture: shoot the viewport N ms after commit, no settling
    await page.goto(BASE + ROUTE, { waitUntil: 'commit', timeout: 90000 })
    await page.waitForTimeout(DELAY)
    await page.screenshot({ path: path.join(OUT, file) })
    await ctx.close()
    console.log(`  ✓ ${file} (t+${DELAY}ms)`)
    return
  }
  await page.goto(BASE + ROUTE, { waitUntil: 'networkidle', timeout: 90000 })
  // let fonts, reveals and any intro motion settle
  await page.waitForTimeout(3500)
  if (SCROLL) {
    // step to the target so scrubbed timelines track, then hold and shoot
    await page.evaluate(async (y) => {
      for (let p = 0; p <= 1.001; p += 0.1) { window.scrollTo(0, y * p); await new Promise((r) => setTimeout(r, 60)) }
      window.scrollTo(0, y)
    }, SCROLL)
    await page.waitForTimeout(1000)
    if (MOUSE.length === 2 && !Number.isNaN(MOUSE[0])) {
      await page.mouse.move(MOUSE[0], MOUSE[1], { steps: 10 })
      await page.waitForTimeout(900)
    }
    await page.screenshot({ path: path.join(OUT, file) })
    await ctx.close()
    console.log(`  ✓ ${file} (scrollY=${SCROLL})`)
    return
  }
  if (MOUSE.length === 2 && !Number.isNaN(MOUSE[0])) {
    await page.mouse.move(MOUSE[0], MOUSE[1], { steps: 10 })
    await page.waitForTimeout(900)
    await page.screenshot({ path: path.join(OUT, file) })
    await ctx.close()
    console.log(`  ✓ ${file} (mouse ${MOUSE[0]},${MOUSE[1]})`)
    return
  }
  await page.evaluate(async () => {
    // trigger scroll-reveals across the whole page, then return to top
    const h = document.body.scrollHeight
    for (let y = 0; y < h; y += window.innerHeight) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(OUT, file), fullPage: true })
  await ctx.close()
  console.log(`  ✓ ${file}`)
}

;(async () => {
  console.log(`▶ starting dev server on :${PORT} …`)
  const server = spawn('npx', ['next', 'dev', '-p', String(PORT)], { cwd: __dirname, shell: true })
  const kill = () => { try { process.platform === 'win32' ? spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { shell: true }) : server.kill('SIGTERM') } catch {} }
  try {
    await waitForServer(BASE)
    console.log('▶ server ready — capturing …')
    const browser = await chromium.launch()
    if (MOBILE && (SCROLL || DELAY)) {
      // state checks at mobile width only
      await shoot(browser, 390, 844, 'latest-mobile.png')
    } else {
      await shoot(browser, 1440, 900, 'latest.png')
      if (MOBILE) await shoot(browser, 390, 844, 'latest-mobile.png')
    }
    await browser.close()
    console.log('✓ done → screenshots/latest.png')
  } catch (e) {
    console.error('✗ screenshot failed:', e.message)
    process.exitCode = 1
  } finally {
    kill()
    setTimeout(() => process.exit(process.exitCode || 0), 800)
  }
})()
