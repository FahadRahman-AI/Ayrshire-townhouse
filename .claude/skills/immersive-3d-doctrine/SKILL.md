---
name: immersive-3d-doctrine
description: >-
  ALWAYS load for ANY design, UI, layout, styling, motion, scroll, WebGL, or 3D
  work in the property-tour project — new components, page sections, animations,
  camera work, shaders, transitions, typography, or micro-interactions. This is
  the reference-grade motion + 3D standard reverse-engineered from loftthirtyone.com
  (Framer), era-residence.com (Webflow + GSAP), and amaliisland.twkmedia.com
  (hand-rolled Three.js). Encodes the exact libraries, techniques, camera-path
  math, shader patterns, scroll architecture, and design tokens those sites use.
  Trigger words: 3D, WebGL, three, R3F, scroll, animation, motion, camera, shader,
  flythrough, tour, hero, reveal, cursor, parallax, transition, design, UI, style.
---

# Immersive 3D & Motion Doctrine

The house style for **property-tour**. Every visual/interaction decision must
match the fidelity of the three reference sites below. This project already ships
the exact stack they use — **Next.js 14 + React Three Fiber + drei + three + GSAP
+ Lenis + Fraunces/Inter** — so there is no excuse for lower-fidelity output.

Pair this with the user's **Operating Doctrine** (Level-4 Apple/Anthropic bar).
This file is the *how*; the doctrine is the *bar*.

---

## 0. The three references — what each one teaches

| Site | Stack (verified from source) | The lesson to steal |
|------|------------------------------|---------------------|
| **loftthirtyone.com** | Framer + **Lenis 1.3.19**; Noto Serif Display / Inter / Fragment Mono; CSS `perspective`, `<canvas>`, video hero | Editorial restraint. Big serif display headings, mono micro-labels, inertial scroll, hero *video* used like a 3D shot. Whitespace is the luxury signal. |
| **era-residence.com** | Webflow + **GSAP 3.15** (ScrollTrigger, **SplitText**, **CustomEase**) + **Lenis 1.3.21** + **Lottie 5.12.2** + Typekit | Scroll-scrubbed **text reveals** (SplitText per-char/word), **day↔night toggle**, custom-eased section transitions, Lottie for tiny vector motion. Palette: cream `#f3f3ec`, deep navy `#17233b`, slate `#758696`, amber `#ffa800`. |
| **amaliisland.twkmedia.com** | WordPress + **hand-rolled Three.js** (`webgl.js`, 3.1 MB) | The crown jewel. Full WebGL: **GLTF models**, **camera flies along a `CatmullRomCurve3`/`CubicBezierCurve3` path** driven by scroll, `getPointAt(t)` + `getTangent(t)` → `lookAt`, **custom ShaderMaterial** (displacement / `mix` / `fract` / `smoothstep` / `uTime`), **instanced meshes**, **Raycaster** hover/click, **THREE.Audio** ambient sound, `lerp`/`damp` smoothing. |

**Common DNA across all three (non-negotiable for this project):**
0. **FULL-BLEED, ALWAYS.** Every hero and chapter image fills the entire viewport
   edge-to-edge (CSS `cover`, or a 3D plane scaled to cover the frustum). **Never
   float imagery in a void** — a small photo on a black background reads as a cheap
   slideshow, no matter how good the motion. This single choice is the difference
   between "colossal" and "small." Loft's every frame is full-bleed drone/interior
   cinematography with a colossal serif+italic headline bottom-left, minimal chrome
   (monogram top-left, CTA top-right, "scroll to explore" cue, progress rail). Match
   that structure. Our edge over Loft: full-bleed **plus** real depth parallax.
1. **Lenis inertial smooth scroll** drives everything. Scroll position *is* the timeline.
2. **Scroll-linked 3D camera motion** — the signature move. Amali flies a camera down a curve; we fly through property rooms.
3. **Editorial serif display + clean sans body**, generous whitespace, one warm accent.
4. **Cream/paper background + deep ink text + a single warm accent.**
5. **Text reveals** on enter (SplitText-style), **scrubbed** to scroll where it reads as cinematic.
6. **60fps, zero-CLS, reduced-motion honored.**

---

## 1. Canonical stack — use these, not alternatives

```
Smooth scroll ...... @studio-freight/lenis      (already the scroll source of truth)
3D / WebGL ......... three + @react-three/fiber + @react-three/drei
Sequencing ......... gsap + ScrollTrigger        (bridge to Lenis — §3)
Text splitting ..... gsap SplitText  (or manual char/word spans if licensing matters)
Fonts .............. next/font/google → Fraunces (display serif) + Inter (body sans)
```

Do **not** introduce Framer Motion, Locomotive, Swiper, or a second scroll engine.
Lenis is the single scroll authority; GSAP reads from it. Adding a competing rAF
loop or scroll listener causes jank and double-smoothing.

---

## 2. THE signature technique — scroll-driven camera on a curve

The current `Tour3D` flies straight down `-Z` through image planes. That is the
floor, not the ceiling. The Amali-grade upgrade is a **camera that banks along a
spline**, so the flythrough feels like gliding through a home, not a slideshow.

### 2a. Define a path through the rooms
```ts
// lib/cameraPath.ts
import * as THREE from 'three'

// One control point per room; gentle S-curve so the camera drifts, not marches.
export const CAMERA_PATH = new THREE.CatmullRomCurve3(
  ROOMS.map((r, i) => new THREE.Vector3(
    Math.sin(i * 0.6) * 2.2,   // subtle lateral sway
    Math.cos(i * 0.4) * 0.8,   // gentle rise/fall
    -i * SPACING,              // primary travel axis
  )),
  false,            // not closed
  'catmullrom',
  0.5,              // tension — lower = looser, more cinematic drift
)
```

### 2b. Drive it from scroll progress (inside `useFrame`)
```ts
useFrame(() => {
  const t = clamp01(progress.current)              // 0..1 from Lenis scroll
  const pos = CAMERA_PATH.getPointAt(t)            // arc-length param → even speed
  const tan = CAMERA_PATH.getTangent(t)            // heading along the curve

  // Critically damped follow — never snap. This is Amali's `lerp`/`damp`.
  easing.damp3(camera.position, pos, 0.25, delta)  // drei/maath easing
  const look = pos.clone().add(tan.multiplyScalar(8))
  camera.lookAt(look)                              // look where we're heading
})
```
Rules:
- **Free flythrough → `getPointAt`** (arc-length) for even speed on curved segments.
  **Content-on-rails (image-plane tour) → `getPoint`** (native param): at
  `p = i/(N-1)` it lands *exactly* on control point `i`, so each room registers
  perfectly to its FloorPlan jump and caption. This project uses `getPoint` because
  framing correctness dominates and our segments are near-equal length (speed stays
  effectively constant). See `lib/path.ts` + `Tour3D`.
- **Damp, never assign.** Direct `camera.position.copy` reintroduces scroll jitter.
  Use `maath`/drei `easing.damp3` or a manual `lerp` at ~0.1–0.25.
- **`lookAt` the tangent ahead**, not a fixed point — that is what makes it bank.
- Add pointer parallax as a *small* offset on top (`±1.1` x, `±0.7` y), damped ~0.06.

### 2c. Room-to-room presence
Keep the band-opacity fade already in `Tour3D` (fog in, hold, dissolve as we pass
through). Layer a **shader transition** (§4) when crossing a room threshold for the
Amali "melt through the wall" feel.

---

## 3. Scroll architecture — Lenis ↔ GSAP ScrollTrigger bridge

GSAP is installed but not yet wired. When a section needs scrubbed sequencing
(pinned reveals, staged text, progress-linked 3D), bridge Lenis into ScrollTrigger
instead of adding a second scroll listener:

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// Inside SmoothScroll's effect, after Lenis is created:
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)   // let GSAP own the rAF; drop Lenis's own loop
```
Now `scrub: true` ScrollTriggers ride the same inertial timeline as the 3D camera —
no desync. Keep the raw `window.scrollY` read in `Tour3D` **only** if you don't
migrate it to ScrollTrigger; do not run both a manual listener *and* ScrollTrigger
on the same range.

**Section reveal preset (era-residence pattern):**
```ts
gsap.from('[data-reveal]', {
  yPercent: 40, opacity: 0, duration: 1.1, stagger: 0.08,
  ease: 'expo.out',
  scrollTrigger: { trigger: el, start: 'top 80%' },
})
```

---

## 4. Shaders — the Amali surface language

Amali's `webgl.js` leans on `displacement`, `mix`, `fract`, `smoothstep`, `uTime`.
Use a `ShaderMaterial` when a plane needs to *transition* or *breathe*, not just
show a texture. Canonical room-crossing dissolve:

```glsl
// fragment — cross-dissolve two rooms with a soft displacement wipe
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uProgress;   // 0..1, scroll-driven
uniform float uTime;
varying vec2 vUv;

void main() {
  float wipe = smoothstep(0.0, 1.0, uProgress);
  vec2 disp  = vec2(sin(vUv.y * 8.0 + uTime) * 0.02 * (1.0 - wipe), 0.0);
  vec4 from  = texture2D(uFrom, vUv + disp);
  vec4 to    = texture2D(uTo,   vUv - disp);
  gl_FragColor = mix(from, to, wipe);
}
```
Feed `uProgress` from the same `progress` ref the camera reads, and tick `uTime`
in `useFrame`. Keep displacement subtle (≤0.03) — luxury reads as *calm*.

For repeated geometry (foliage, particles, light motes) use **`InstancedMesh`**
with per-instance attributes (`aScale`, `aSpeed`, `aRadius` — exactly Amali's
attribute names) rather than N meshes. One draw call, thousands of elements.

---

## 5. Text reveals & micro-copy

- **Display headings**: Fraunces, light weight, *italic*, tight leading
  (`line-height: 0.9–0.95`), negative tracking (`-0.025em`). Reveal with SplitText
  by **word or line** (not char for long headings — char-stagger on a 3-word hero
  is fine, on a paragraph it's noise).
- **Micro-labels / counters / eyebrows**: Inter, 10–11px, `letter-spacing: 0.16em`,
  uppercase, in the accent color. (Loft's Fragment Mono role.)
- **Reveal ease**: `expo.out` / `cubic-bezier(0.16, 1, 0.3, 1)` for entrances;
  `power2.inOut` for reversible/scrubbed. Register a CustomEase once if you need
  the era-residence signature curve.
- Always guard SplitText reveals behind `prefers-reduced-motion` — fall back to a
  simple opacity fade.

---

## 6. Design tokens (house palette + type)

Derived from the references, tuned warm for a townhouse (matches current globals.css):

```css
:root {
  /* surface */
  --ink:    #14110f;   /* near-black warm background (3D void, dark sections) */
  --paper:  #f5f2ee;   /* cream text on ink / light section bg (era #f3f3ec) */
  --slate:  #8a8178;   /* muted captions / secondary (era #758696 role) */
  --accent: #c9a86a;   /* single warm gold — CTAs, eyebrows, active states */

  /* motion */
  --ease-expo:   cubic-bezier(0.16, 1, 0.30, 1);   /* entrances, HUD */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* reversible */
  --dur-fast: 0.4s;  --dur:  0.7s;  --dur-slow: 1.1s;
}
```
Rules: **one** accent, never two. Cream + ink + accent only; the slate is for
hierarchy, not decoration. Legibility over imagery is mandatory — any HUD/hero text
over 3D/photo needs a **directional scrim** (see `.tour3d__hud::before`), never bare
text-shadow on bright frames.

---

## 7. Micro-interactions (present across all three)

- **Custom cursor** (already `Cursor.tsx`): grows/labels on interactive targets;
  hide the native cursor only on pointer-fine devices.
- **Magnetic CTA**: on hover, translate the button toward the pointer (`~0.15`
  strength), damped; the era "Get in touch" energy.
- **Day ↔ night toggle** (era signature): if the property has evening shots, offer
  a toggle that cross-fades the room textures / light color — high-perceived-value,
  low cost.
- **Ambient audio toggle** (Amali `THREE.Audio`): optional muted-by-default ambient
  track with a "click for sound" affordance. Never autoplay with sound.
- **Persistent conversion**: keep the `ReserveBar` / booking CTA reachable at all
  scroll depths (commercial-viability filter from the doctrine).

---

## 8. Performance & correctness gates (Definition of Done)

Every change ships only if ALL pass:
- [ ] **60fps** during scroll+flythrough (throttle DevTools 4×, still smooth).
- [ ] **Zero CLS** — reserve dimensions; fonts via `next/font` (no FOUT shift);
      canvas is fixed and sized to viewport.
- [ ] `frameloop="never"` (or paused) when the 3D stage is off-screen / covered —
      never render WebGL the user can't see (battery + heat).
- [ ] `dpr={[1, 1.75]}` cap; textures sized to display, `anisotropy` ≤ 8.
- [ ] **`prefers-reduced-motion`**: camera snaps (no lerp), reveals become fades,
      Lenis disabled, shader time frozen.
- [ ] **Fully typed, zero placeholders**, no `any` leaks in the R3F layer.
- [ ] Text over imagery passes contrast via scrim, not luck.
- [ ] `npm run build` + `tsc --noEmit` clean; verify visually via `node screenshot.js --full`.
- [ ] Dispose textures/geometries on unmount; no listener/rAF leaks (mirror
      `SmoothScroll`'s cleanup).

---

## 9. Working method for any visual task here

1. **Name the reference.** Which of the three does this borrow from, and which
   specific technique (curve-cam / SplitText scrub / shader dissolve / toggle)?
2. **Reuse before adding.** The stack is complete — reach for R3F + GSAP + Lenis,
   not a new dependency.
3. **Build it, then *see* it.** Always regenerate `screenshots/` and read the PNGs;
   do not declare motion/3D done from code alone.
4. **Report in the doctrine's 3 parts**: Executive Strategy Brief → Flawless
   Technical Execution → Visual & Motion Standard.
