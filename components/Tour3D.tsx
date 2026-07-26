'use client'

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { ROOMS, SPACING, CAM_START, FOV, BASE_H } from '@/lib/rooms'
import { ROOM_POINTS, ROOM_CURVE } from '@/lib/path'
import { PROPERTY } from '@/lib/property'

const INK = '#14110f'
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** Frame-rate-independent damping factor for a given responsiveness (per second). */
const dampFactor = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt)

// ── Depth-displacement room shader (2.5D parallax) ───────────────────────────
// Each photo is turned into real geometry: a subdivided plane whose vertices are
// pushed toward/away from the camera by a per-pixel depth map (near = bright).
// Because near pixels are now physically closer, any camera movement makes the
// foreground parallax against the background — you move THROUGH the room instead
// of watching a flat picture slide by. A melt ripple survives for transitions.
const ROOM_VERT = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  uniform float uAlpha;
  uniform float uTime;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;               // 0 far … 1 near
    vDepth = d;
    vec3 p = position;
    p.z += (d - 0.5) * uDepthScale;                  // displace into real depth
    float melt = 1.0 - uAlpha;                       // 0 when focused, 1 when gone
    p.z += sin(uv.y * 6.0 + uTime) * 0.35 * melt;    // ripple as it melts away
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const ROOM_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uAlpha;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vec4 texel = texture2D(uMap, vUv);
    float melt = 1.0 - uAlpha;
    // gently deepen far pixels so displaced geometry reads as volume, not a decal
    vec3 col = texel.rgb * mix(0.82, 1.0, vDepth);
    gl_FragColor = vec4(col + vec3(0.05 * melt), texel.a * uAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/** Split a heading into per-word spans so CSS can stagger each word's rise. */
function SplitWords({ text, className, as: Tag = 'span' }: { text: string; className: string; as?: 'h1' | 'h2' | 'span' }) {
  return (
    <Tag className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span className="word" key={`${word}-${i}`} aria-hidden>
          <span className="word__inner" style={{ '--wi': i } as CSSProperties}>{word}</span>
        </span>
      ))}
    </Tag>
  )
}

/** Opacity for a room given its distance ahead of the camera (d = camZ - roomZ). */
function bandOpacity(d: number) {
  if (d >= 2 * SPACING) return 0                          // far beyond → fog/black
  if (d >= SPACING) return 1 - (d - SPACING) / SPACING    // emerging from depth
  if (d >= 2) return 1                                     // full, in front of camera
  if (d >= -3) return clamp01((d + 3) / 5)                // flying through it → fade
  return 0                                                 // behind camera
}

interface SceneProps {
  progress: MutableRefObject<number>
  reduceMotion: boolean
}

function Scene({ progress, reduceMotion }: SceneProps) {
  const { camera, size } = useThree()
  const textures = useTexture(ROOMS.map((r) => `/images/${r.file}`))
  const depths = useTexture(ROOMS.map((r) => `/depth/${r.file.replace(/\.jpe?g$/i, '.png')}`))

  // sRGB + plane dimensions from each image's true aspect ratio (no distortion)
  const dims = useMemo(() => {
    return textures.map((t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      const img = t.image as HTMLImageElement | undefined
      const aspect = img && img.height ? img.width / img.height : 1.5
      return { w: BASE_H * aspect, h: BASE_H }
    })
  }, [textures])

  // FULL-BLEED cover scale — each room fills the entire viewport edge-to-edge
  // (like CSS background-size: cover), recomputed on resize. The extra margin
  // guarantees no ink void peeks in during parallax/push-in. This is what turns
  // "floating photos in a void" into a colossal, immersive frame.
  const coverScale = useMemo(() => {
    const vAspect = size.width / Math.max(1, size.height)
    const visH = 2 * Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_START
    const visW = visH * vAspect
    return dims.map((d) => Math.max(visW / d.w, visH / d.h) * 1.28)
  }, [size.width, size.height, dims])

  // Depth maps are raw data, not colour — keep them linear and smoothly filtered.
  useMemo(() => {
    depths.forEach((d) => {
      d.colorSpace = THREE.NoColorSpace
      d.minFilter = THREE.LinearFilter
      d.magFilter = THREE.LinearFilter
      d.generateMipmaps = false
    })
  }, [depths])

  // One depth-displacement ShaderMaterial per room; disposed on unmount (§8).
  const materials = useMemo(
    () =>
      textures.map(
        (tex, i) =>
          new THREE.ShaderMaterial({
            uniforms: {
              uMap: { value: tex },
              uDepth: { value: depths[i] },
              uDepthScale: { value: 3.2 },
              uAlpha: { value: 0 },
              uTime: { value: 0 },
            },
            vertexShader: ROOM_VERT,
            fragmentShader: ROOM_FRAG,
            transparent: true,
            depthWrite: false,
          }),
      ),
    [textures, depths],
  )
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])

  // Persistent scratch vectors — zero allocation inside the frame loop.
  const tmp = useMemo(() => {
    const lookAt = new THREE.Vector3()
    ROOM_CURVE.getPoint(0.03, lookAt)
    return { cur: new THREE.Vector3(), look: new THREE.Vector3(), target: new THREE.Vector3(), lookAt }
  }, [])

  const meshes = useRef<(THREE.Mesh | null)[]>([])

  useFrame((state, delta) => {
    const p = clamp01(progress.current)
    const ud = (camera as THREE.Camera & { userData: { px?: number; py?: number } }).userData

    // Fly the shared spline: where we are (cur) and where we're heading (look).
    // getPoint (native param) — lands exactly on control point i at p = i/(N-1),
    // so each room registers perfectly to its FloorPlan jump and caption.
    ROOM_CURVE.getPoint(p, tmp.cur)
    ROOM_CURVE.getPoint(clamp01(p + 0.03), tmp.look)

    // Sit CAM_START in front of the current room point. Pointer parallax kept
    // modest so the full-bleed frame never reveals the void at its edges — depth
    // still reads because the geometry is genuinely displaced.
    tmp.target.set(tmp.cur.x + (ud.px ?? 0) * 1.0, tmp.cur.y + (ud.py ?? 0) * 0.6, tmp.cur.z + CAM_START)

    if (reduceMotion) {
      camera.position.copy(tmp.target)
      camera.rotation.set(0, 0, 0)
      camera.lookAt(tmp.cur)
    } else {
      // Critically damped follow (frame-rate independent) — never snaps.
      const l = dampFactor(5, delta)
      camera.position.lerp(tmp.target, l)
      tmp.lookAt.lerp(tmp.look, l)
      camera.lookAt(tmp.lookAt)                       // aim where we're heading → banks
      camera.rotateZ((tmp.cur.x - tmp.look.x) * 0.03) // roll into the horizontal turn
    }

    const time = state.clock.elapsedTime
    meshes.current.forEach((m, i) => {
      if (!m) return
      const d = camera.position.z - ROOM_POINTS[i].z
      const a = bandOpacity(d)
      const mat = materials[i]
      mat.uniforms.uAlpha.value = a
      mat.uniforms.uTime.value = time
      m.visible = a > 0.001
      // full-bleed cover scale, with an extra push as we fly through the room
      m.scale.setScalar(coverScale[i] * (d < 2 ? lerp(1, 1.22, clamp01((2 - d) / 5)) : 1))
    })
  })

  return (
    <group>
      {ROOMS.map((room, i) => (
        <mesh
          key={room.file}
          ref={(el) => { meshes.current[i] = el }}
          position={ROOM_POINTS[i].toArray()}
          material={materials[i]}
        >
          {/* densely subdivided so the depth map can sculpt real geometry */}
          <planeGeometry args={[dims[i].w, dims[i].h, 160, 160]} />
        </mesh>
      ))}
    </group>
  )
}

export default function Tour3D() {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(0)
  const [inTour, setInTour] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const progress = useRef(0)
  const cameraUserData = useRef({ px: 0, py: 0 })

  useEffect(() => {
    setMounted(true)
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const onScroll = () => {
      const vh = window.innerHeight
      // 2×vh of scroll per room segment — matches FloorPlan's jumpTo(i) math so
      // clicking a room in the navigator focuses exactly that room.
      const focusSpan = (ROOMS.length - 1) * 2 * vh
      const totalSpan = focusSpan + vh // hold a beat on the final room
      const p = clamp01(window.scrollY / focusSpan)
      progress.current = p
      setActive(Math.min(ROOMS.length - 1, Math.round(p * (ROOMS.length - 1))))
      // Once the commercial layer starts covering the stage, retire the tour.
      setInTour(window.scrollY < totalSpan - vh * 0.5)
    }
    const onPointer = (e: PointerEvent) => {
      cameraUserData.current.px = (e.clientX / window.innerWidth - 0.5) * 2
      cameraUserData.current.py = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  const room = ROOMS[active]
  const isHero = active === 0
  const counter = `${String(active + 1).padStart(2, '0')} / ${String(ROOMS.length).padStart(2, '0')}`
  const monogram = PROPERTY.name
    .split(' ')
    .filter((w) => !/^(the|a|an|of|and)$/i.test(w))
    .map((w) => w[0])
    .join('')

  return (
    <div className="tour3d">
      {/* scroll driver — generates the scroll length the camera reads
          ((ROOMS-1) segments of 200vh) + 100vh hold on the last room */}
      <div className="tour3d__spacer" style={{ height: `${(ROOMS.length - 1) * 200 + 100}vh` }} />

      {/* fixed 3D stage */}
      <div className={`tour3d__stage ${inTour ? '' : 'tour3d__stage--out'}`} aria-hidden>
        {mounted && (
          <Canvas
            flat
            dpr={[1, 1.75]}
            frameloop={inTour ? 'always' : 'never'}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            camera={{ fov: FOV, position: [0, 0, CAM_START], near: 0.1, far: 400 }}
            onCreated={({ camera, scene }) => {
              camera.userData = cameraUserData.current
              scene.background = new THREE.Color(INK)
              scene.fog = new THREE.Fog(INK, 10, 2 * SPACING + 4)
            }}
          >
            <Suspense fallback={null}>
              <Scene progress={progress} reduceMotion={reduceMotion} />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* fixed cinematic HUD overlay (Loft-style full-bleed chrome) */}
      <div className={`tour3d__hud ${inTour ? '' : 'tour3d__hud--out'}`}>
        {/* top chrome — monogram + location */}
        <div className="hud-top">
          <span className="hud-mark" aria-label={PROPERTY.name}>{monogram}</span>
          <span className="hud-loc">{PROPERTY.location}</span>
        </div>

        {/* centred scroll cue — retires on the final room */}
        {active < ROOMS.length - 1 && (
          <div className="hud-scroll" aria-hidden>
            <span className="hud-scroll__ring">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </span>
            <span className="hud-scroll__label">Scroll to explore</span>
          </div>
        )}

        {/* colossal bottom-left headline — brand splash on chapter 0, then rooms */}
        <div className="hud-headline" key={active}>
          {isHero && (
            <p className="hud-eyebrow">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden>
                <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2 1.3-7-5-4.8 7-.9z" />
              </svg>
              {PROPERTY.rating} · {PROPERTY.reviewCount} reviews{PROPERTY.superhost ? ' · Superhost' : ''}
            </p>
          )}
          <SplitWords
            text={isHero ? PROPERTY.name : room.label}
            className="hud-title"
            as={isHero ? 'h1' : 'h2'}
          />
          <p className="hud-body">{isHero ? PROPERTY.tagline : room.desc}</p>
        </div>

        {/* bottom rail — counter + progress + tagline */}
        <div className="hud-rail">
          <span className="hud-counter">{counter}</span>
          <span className="hud-track"><span className="hud-fill" style={{ transform: `scaleX(${(active) / (ROOMS.length - 1)})` }} /></span>
          <span className="hud-tag">A restored Victorian retreat</span>
        </div>
      </div>
    </div>
  )
}
