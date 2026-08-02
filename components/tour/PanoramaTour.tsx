'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ROOMS } from '@/lib/tour'

const PITCH_LIMIT = 1 // radians, per spec
const DRAG_SENSITIVITY = 0.0028
const GLIDE = 14 // release momentum multiplier — how far the look coasts
const DAMP = 0.085 // lerp factor toward target rotation
const FOV_FAR = 75
const FOV_NEAR = 65 // fov narrows across a room's scroll range → forward motion
const WIPE_MS = 900

interface RoomScene {
  scene: THREE.Scene
  geometry: THREE.SphereGeometry
  material: THREE.MeshBasicMaterial
  texture: THREE.Texture
}

function createRoomScene(loader: THREE.TextureLoader, src: string): RoomScene {
  const scene = new THREE.Scene()
  const geometry = new THREE.SphereGeometry(500, 60, 40)
  geometry.scale(-1, 1, 1) // render the panorama on the inside of the sphere
  const texture = loader.load(src)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.MeshBasicMaterial({ map: texture })
  scene.add(new THREE.Mesh(geometry, material))
  return { scene, geometry, material, texture }
}

function disposeRoomScene(room: RoomScene) {
  room.geometry.dispose()
  room.material.dispose()
  room.texture.dispose()
}

/** Character-split headline — each char rises in with a stagger. */
function SplitName({ text }: { text: string }) {
  let i = 0
  return (
    <>
      {text.split(' ').map((word, w) => (
        <span className="tour__word" key={w}>
          {word.split('').map((ch) => (
            <span className="tour__char" key={`${w}-${ch}-${i}`} style={{ '--ci': i++ } as React.CSSProperties}>
              {ch}
            </span>
          ))}{' '}
        </span>
      ))}
    </>
  )
}

export default function PanoramaTour() {
  const mountRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [roomIndex, setRoomIndex] = useState(0)
  const [hintDone, setHintDone] = useState(false)
  const roomChangeRef = useRef(setRoomIndex)
  const hintRef = useRef(setHintDone)

  useEffect(() => {
    const host = mountRef.current!
    const spacer = spacerRef.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.registerPlugin(ScrollTrigger)

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(window.innerWidth, window.innerHeight)
    host.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(FOV_FAR, window.innerWidth / window.innerHeight, 0.1, 1100)
    camera.rotation.order = 'YXZ' // yaw then pitch — no roll creep while dragging

    const loader = new THREE.TextureLoader()

    // ── Room scene lifecycle ─────────────────────────────────────
    // Only the active room holds GPU resources; neighbours' textures are
    // pre-warmed via the browser cache so the wipe never reveals a blank sphere.
    let active = createRoomScene(loader, ROOMS[0].panorama)
    let activeIndex = 0

    const prewarm = (i: number) => {
      if (i < 0 || i >= ROOMS.length) return
      const img = new Image()
      img.src = ROOMS[i].panorama
    }
    prewarm(1)

    // ── Drag-to-look with inertia ────────────────────────────────
    let yaw = ROOMS[0].startYaw
    let pitch = 0
    let targetYaw = yaw
    let targetPitch = 0
    let dragging = false
    let lastX = 0
    let lastY = 0
    let velYaw = 0
    let velPitch = 0

    const clampPitch = (v: number) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, v))

    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      velYaw = 0
      velPitch = 0
      host.classList.add('is-dragging')
      renderer.domElement.setPointerCapture(e.pointerId)
      hintRef.current(true) // the hint has served its purpose
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      // grab-the-world: drag right turns the view left
      velYaw = dx * DRAG_SENSITIVITY
      velPitch = dy * DRAG_SENSITIVITY
      targetYaw += velYaw
      targetPitch = clampPitch(targetPitch + velPitch)
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      host.classList.remove('is-dragging')
      // fling: momentum carries the look, the damp lerp decelerates it
      targetYaw += velYaw * GLIDE
      targetPitch = clampPitch(targetPitch + velPitch * GLIDE)
    }

    const el = renderer.domElement
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)

    // ── Room switch with clip-path wipe ──────────────────────────
    // The outgoing room's last frame is copied synchronously into a 2D canvas
    // overlay (drawImage from the WebGL buffer — preserveDrawingBuffer keeps
    // it valid), the scene swaps beneath it, and the overlay wipes away
    // right-to-left (mirrored when scrubbing backwards). Outgoing GPU
    // resources are disposed immediately.
    let wipeEl: HTMLCanvasElement | null = null

    const switchRoom = (nextIndex: number) => {
      const forward = nextIndex > activeIndex
      const outgoing = active

      if (!reduced) {
        if (wipeEl) {
          gsap.killTweensOf(wipeEl)
          wipeEl.remove()
        }
        const frame = document.createElement('canvas')
        frame.className = 'tour__wipe'
        frame.width = renderer.domElement.width
        frame.height = renderer.domElement.height
        frame.getContext('2d')!.drawImage(renderer.domElement, 0, 0)
        frame.style.clipPath = 'inset(0% 0% 0% 0%)'
        // body-level, not inside the stage: children of the fixed stage that
        // sit above the WebGL canvas fail to composite in headless Chromium,
        // and the verification mechanism must see what users see
        document.body.appendChild(frame)
        wipeEl = frame
        gsap.fromTo(frame, { clipPath: 'inset(0% 0% 0% 0%)' }, {
          clipPath: forward ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)',
          duration: WIPE_MS / 1000,
          ease: 'power3.inOut',
          onComplete: () => {
            frame.remove()
            if (wipeEl === frame) wipeEl = null
          },
        })
      }

      active = createRoomScene(loader, ROOMS[nextIndex].panorama)
      activeIndex = nextIndex
      yaw = targetYaw = ROOMS[nextIndex].startYaw
      pitch = targetPitch = 0
      disposeRoomScene(outgoing)
      prewarm(nextIndex - 1)
      prewarm(nextIndex + 1)
      roomChangeRef.current(nextIndex)
    }

    // ── Scroll → tour progress ───────────────────────────────────
    // Spacer is (N+1)·100vh, so scrollable distance is N viewports: each room
    // owns one full-viewport scroll unit of the scrub.
    const progress = { p: 0 }
    const st = ScrollTrigger.create({
      trigger: spacer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progress.p = self.progress * ROOMS.length
      },
    })

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // verification hook: proves scene disposal (geometries/textures counts)
    const w = window as unknown as Record<string, unknown>
    w.__tourInfo = () => ({ ...renderer.info.memory, room: activeIndex })

    let raf = 0
    const tick = () => {
      const p = Math.min(progress.p, ROOMS.length - 0.0001)
      const roomIdx = Math.floor(p)
      if (roomIdx !== activeIndex) switchRoom(roomIdx)

      // fov narrows through the room — a quiet sense of walking forward
      const local = p - roomIdx
      const fov = FOV_FAR - (FOV_FAR - FOV_NEAR) * local
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov
        camera.updateProjectionMatrix()
      }

      if (barRef.current) barRef.current.style.transform = `scaleX(${p / ROOMS.length})`

      const k = reduced ? 1 : DAMP
      yaw += (targetYaw - yaw) * k
      pitch += (targetPitch - pitch) * k
      camera.rotation.y = yaw
      camera.rotation.x = clampPitch(pitch)
      renderer.render(active.scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      st.kill()
      window.removeEventListener('resize', onResize)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      if (wipeEl) {
        gsap.killTweensOf(wipeEl)
        wipeEl.remove()
      }
      disposeRoomScene(active)
      renderer.dispose()
      host.removeChild(el)
      delete w.__tourInfo
    }
  }, [])

  const jumpTo = useCallback((i: number) => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    const y = scrollable * ((i + 0.5) / ROOMS.length)
    const lenis = (window as unknown as Record<string, unknown>).__lenis as
      | { scrollTo: (y: number, o?: Record<string, unknown>) => void }
      | undefined
    if (lenis) lenis.scrollTo(y, { duration: 1.6 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }, [])

  const room = ROOMS[roomIndex]
  const last = roomIndex === ROOMS.length - 1
  const hintHidden = hintDone || roomIndex > 0

  return (
    <>
      <div ref={mountRef} className="tour__stage" aria-label="360° room view — drag to look around" />

      <div className="tour__ui">
        <div className="tour__scrim" aria-hidden />
        <div className="tour__progress" aria-hidden>
          <div ref={barRef} className="tour__progress-bar" />
        </div>

        <header className="tour__topbar">
          <a className="tour__home" href="/">The Edgbaston Townhouse</a>
          <span className="tour__counter">
            {String(roomIndex + 1).padStart(2, '0')} / {String(ROOMS.length).padStart(2, '0')}
          </span>
        </header>

        <div className="tour__chapter" key={room.slug}>
          <p className="tour__eyebrow">{room.eyebrow}</p>
          <h1 className="tour__name">
            <SplitName text={room.name} />
          </h1>
        </div>

        <p className={`tour__hint ${hintHidden ? 'tour__hint--done' : ''}`} aria-hidden={hintHidden}>
          Click and drag to look around
        </p>

        <nav className="tour__dots" aria-label="Rooms">
          {ROOMS.map((r, i) => (
            <button
              key={r.slug}
              className={`tour__dot ${i === roomIndex ? 'tour__dot--active' : ''}`}
              aria-label={`Go to ${r.name}`}
              aria-current={i === roomIndex ? 'step' : undefined}
              onClick={() => jumpTo(i)}
            >
              <span className="tour__dot-mark" />
              <span className="tour__dot-label">{r.name.replace('The ', '')}</span>
            </button>
          ))}
        </nav>

        <a className={`tour__cta ${last ? 'tour__cta--visible' : ''}`} href="/#book" tabIndex={last ? 0 : -1}>
          Enquire about this home
        </a>
      </div>

      <div ref={spacerRef} className="tour__spacer" style={{ height: `${(ROOMS.length + 1) * 100}vh` }} />
    </>
  )
}
