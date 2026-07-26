// screenshot.js — launches dev server, captures each chapter at visual midpoint.
// Usage:
//   node screenshot.js          → screenshots/latest.png (chapter 0)
//   node screenshot.js --full   → all chapters + CTA
//   node screenshot.js --chapter 3  → one specific chapter

const { chromium } = require('playwright')
const { spawn }    = require('child_process')
const fs           = require('fs')
const path         = require('path')
const http         = require('http')

const PORT     = 3099
const BASE     = `http://localhost:${PORT}`
const OUT_DIR  = path.join(__dirname, 'screenshots')
const CHAPTERS = 10
const VH       = 1080   // must match Playwright viewport height

const args       = process.argv.slice(2)
const FULL       = args.includes('--full')
const CHAPTER_ARG = (() => {
  const i = args.indexOf('--chapter')
  return i !== -1 ? parseInt(args[i + 1], 10) : null
})()

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

// ── Helpers ───────────────────────────────────────────────────────────────────

function waitForServer(url, timeout = 45000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () =>
      http.get(url, (res) => {
        if (res.statusCode < 500) return resolve()
        setTimeout(check, 500)
      }).on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('Server timeout'))
        setTimeout(check, 500)
      })
    check()
  })
}

// Chapter i's visual midpoint in scroll-space.
// Pin model: each chapter is 100vh natural + 100vh pin extension = 200vh per chapter.
// Progress 0.4 = well into the hold, past any entry animations, before exit clip.
function chapterScrollY(i) {
  return i * 2 * VH + VH * 0.42
}

// Use Lenis' __forceScroll for accurate GSAP ScrollTrigger sync.
async function jumpTo(page, scrollY) {
  await page.evaluate((y) => {
    const w = window
    if (w.__forceScroll) w.__forceScroll(y)
    else window.scrollTo(0, y)
  }, scrollY)
}

async function shot(page, filePath) {
  await page.waitForTimeout(1400)   // wait for non-scrub text animation (~1s) to complete
  await page.screenshot({ path: filePath, fullPage: false })
  console.log(`  ✓ ${path.relative(__dirname, filePath)}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

;(async () => {
  // Kill anything already on the port
  try {
    const { execSync } = require('child_process')
    execSync(`npx kill-port ${PORT}`, { stdio: 'ignore', shell: true })
    await new Promise(r => setTimeout(r, 400))
  } catch {}

  // Start dev server — shell:true resolves .cmd files on Windows
  console.log(`▶  Starting Next.js dev server on :${PORT}…`)
  const server = spawn(
    'npx next dev -p ' + PORT,
    [],
    { cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'], shell: true },
  )
  server.stderr.on('data', (d) => {
    const s = d.toString()
    if (s.includes('error') || s.includes('Error')) process.stdout.write(s)
  })

  await waitForServer(BASE)
  console.log('✓  Server ready\n')

  // Launch Playwright — retina viewport
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: VH },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message))

  // Navigate and let Lenis + GSAP initialise
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 40000 })
  await page.waitForTimeout(600)

  // Force ScrollTrigger to recalculate all pin spacers after full layout
  await page.evaluate(() => { if (window.__refreshST) window.__refreshST() })
  await page.waitForTimeout(400)

  // ── Chapter 0: already at scrollY 0, text animates in on load ──
  console.log('Capturing chapter 00…')
  await page.waitForTimeout(1600)  // let non-scrub text reveal complete
  const latest = path.join(OUT_DIR, 'latest.png')
  await page.screenshot({ path: latest, fullPage: false })
  console.log(`  ✓ screenshots/latest.png`)

  if (FULL) {
    // Save chapter 0 also as chapter-00.png
    fs.copyFileSync(latest, path.join(OUT_DIR, 'chapter-00.png'))
    console.log('  ✓ screenshots/chapter-00.png')

    // Chapters 1–9
    for (let i = 1; i < CHAPTERS; i++) {
      console.log(`Capturing chapter ${String(i).padStart(2, '0')}…`)
      await jumpTo(page, chapterScrollY(i))
      await shot(page, path.join(OUT_DIR, `chapter-${String(i).padStart(2, '0')}.png`))
    }

    // CTA — scrollY well past last chapter's pin
    console.log('Capturing CTA…')
    await jumpTo(page, CHAPTERS * 2 * VH + VH * 0.3)
    await shot(page, path.join(OUT_DIR, 'cta.png'))
  }

  if (CHAPTER_ARG !== null) {
    console.log(`Capturing chapter ${String(CHAPTER_ARG).padStart(2, '0')}…`)
    if (CHAPTER_ARG === 0) {
      fs.copyFileSync(latest, path.join(OUT_DIR, `chapter-00.png`))
    } else {
      await jumpTo(page, chapterScrollY(CHAPTER_ARG))
      await shot(page, path.join(OUT_DIR, `chapter-${String(CHAPTER_ARG).padStart(2, '0')}.png`))
    }
  }

  await browser.close()
  server.kill('SIGTERM')
  console.log('\n✓  Done — screenshots saved to ./screenshots/')
  process.exit(0)
})().catch((err) => {
  console.error('✗', err.message)
  process.exit(1)
})
