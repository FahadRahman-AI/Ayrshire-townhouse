// scripts/generate-panoramas.js
// Procedural equirectangular panoramas (4096x2048) for the /tour rooms.
// Placeholder-quality by design: swap any file in public/panoramas/ with a real
// 360° capture of the same name and the tour picks it up unchanged.
//
// Equirect facts used here: eye-level horizon sits at y = H/2; the wall→ceiling
// junction reads above it, wall→floor below. Background gradients are purely
// vertical so the x=0 / x=W wrap seam is invisible; windows are kept clear of
// the seam.

const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const W = 4096
const H = 2048
const OUT = path.join(__dirname, '..', 'public', 'panoramas')

const ROOMS = [
  {
    file: '01-hallway',
    ceil: ['#f4ecdc', '#efe5d0'],
    wall: ['#eadfc8', '#dccfb2'],
    floor: ['#3a3227', '#211c13'],
    glow: '#ffe9c2',
    windows: [{ cx: 1024, w: 300, h: 620 }, { cx: 3072, w: 300, h: 620 }],
  },
  {
    file: '02-drawing-room',
    ceil: ['#f6f0e2', '#f0e9d8'],
    wall: ['#ece4d0', '#ded2b8'],
    floor: ['#403729', '#271f14'],
    glow: '#ffedca',
    windows: [
      { cx: 700, w: 340, h: 700 },
      { cx: 1400, w: 340, h: 700 },
      { cx: 3000, w: 460, h: 640 },
    ],
  },
  {
    file: '03-kitchen',
    ceil: ['#f4f0e7', '#eeeadd'],
    wall: ['#eae5d6', '#d8d2bd'],
    floor: ['#37342e', '#201e19'],
    glow: '#fff3d8',
    windows: [{ cx: 1500, w: 620, h: 560 }, { cx: 2900, w: 300, h: 560 }],
  },
  {
    file: '04-bedroom',
    ceil: ['#ecdfd0', '#e4d5c2'],
    wall: ['#dccdb8', '#c6b29a'],
    floor: ['#332a1f', '#1c1610'],
    glow: '#ffd9a3',
    windows: [{ cx: 1100, w: 380, h: 660 }, { cx: 2450, w: 260, h: 660 }],
  },
  {
    file: '05-garden-sauna',
    ceil: ['#e5cda6', '#dcbe90'],
    wall: ['#d6b586', '#b78d5c'],
    floor: ['#48331e', '#28190c'],
    glow: '#ffca8a',
    windows: [{ cx: 2048, w: 700, h: 520 }],
  },
]

// Vertical bands (fractions of H): ceiling → cornice → wall → skirting → floor.
const CORNICE = 0.345
const SKIRTING = 0.655

function roomSvg(r) {
  const corniceY = H * CORNICE
  const skirtY = H * SKIRTING
  const wallH = skirtY - corniceY

  const windows = r.windows
    .map((win, i) => {
      // Keep the window inside the wall band: bottom edge above the skirting.
      const h = Math.min(win.h, wallH * 0.86)
      const cy = skirtY - 60 - h / 2
      const x = win.cx - win.w / 2
      const y = cy - h / 2
      const mullion = `<rect x="${x + win.w * 0.5 - 5}" y="${y}" width="10" height="${h}" fill="#2a2318" opacity="0.9"/>`
      const transom = `<rect x="${x}" y="${y + h * 0.5 - 5}" width="${win.w}" height="10" fill="#2a2318" opacity="0.9"/>`
      return `
      <ellipse cx="${win.cx}" cy="${cy}" rx="${win.w * 1.9}" ry="${h * 1.15}" fill="url(#glow${i})"/>
      <rect x="${x - 26}" y="${y - 26}" width="${win.w + 52}" height="${h + 52}" fill="#2f281c" opacity="0.85" rx="6"/>
      <rect x="${x}" y="${y}" width="${win.w}" height="${h}" fill="url(#light${i})" rx="3"/>
      ${mullion}${transom}
      <ellipse cx="${win.cx}" cy="${skirtY + 300}" rx="${win.w * 2.6}" ry="190" fill="url(#pool${i})"/>`
    })
    .join('\n')

  const glowDefs = r.windows
    .map(
      (win, i) => `
    <radialGradient id="glow${i}">
      <stop offset="0%" stop-color="${r.glow}" stop-opacity="0.5"/>
      <stop offset="60%" stop-color="${r.glow}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${r.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="light${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffdf6"/>
      <stop offset="55%" stop-color="${r.glow}"/>
      <stop offset="100%" stop-color="#f0dcb4"/>
    </linearGradient>
    <radialGradient id="pool${i}">
      <stop offset="0%" stop-color="${r.glow}" stop-opacity="0.16"/>
      <stop offset="70%" stop-color="${r.glow}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${r.glow}" stop-opacity="0"/>
    </radialGradient>`,
    )
    .join('\n')

  // Wall panel seams — subtle verticals so drag rotation is visually legible.
  // Spaced W/16; skip the wrap edge so the seam doesn't double there.
  const seams = Array.from({ length: 15 }, (_, i) => {
    const x = ((i + 1) * W) / 16
    return `<rect x="${x - 2}" y="${corniceY}" width="4" height="${wallH}" fill="#000" opacity="0.05"/>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${r.ceil[0]}"/>
      <stop offset="${CORNICE - 0.015}" stop-color="${r.ceil[1]}"/>
      <stop offset="${CORNICE}" stop-color="${r.wall[0]}"/>
      <stop offset="${SKIRTING - 0.01}" stop-color="${r.wall[1]}"/>
      <stop offset="${SKIRTING}" stop-color="${r.floor[0]}"/>
      <stop offset="1" stop-color="${r.floor[1]}"/>
    </linearGradient>
    ${glowDefs}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${seams}
  <rect x="0" y="${corniceY - 8}" width="${W}" height="8" fill="#000" opacity="0.08"/>
  <rect x="0" y="${skirtY - 14}" width="${W}" height="14" fill="#000" opacity="0.18"/>
  ${windows}
</svg>`
}

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  for (const r of ROOMS) {
    const out = path.join(OUT, `${r.file}.jpg`)
    await sharp(Buffer.from(roomSvg(r))).jpeg({ quality: 82, mozjpeg: true }).toFile(out)
    console.log(`  ✓ ${r.file}.jpg`)
  }
  console.log(`✓ ${ROOMS.length} panoramas → public/panoramas/`)
})()
