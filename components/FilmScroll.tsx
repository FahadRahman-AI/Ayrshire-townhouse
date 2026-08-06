'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FILMS } from '@/lib/films'

gsap.registerPlugin(ScrollTrigger)

// Each clip owns DWELL viewport-heights of scroll; its timeline is scrubbed across
// that span, then a shader displacement-dissolve carries into the next clip.
const dwellFor = () => (window.matchMedia('(max-width: 720px)').matches ? 1.05 : 1.25)
const TRANSITION = 0.16 // fraction of a segment spent cross-dissolving into the next

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uAspectA;
  uniform float uAspectB;
  uniform float uScreen;
  uniform float uMix;
  uniform float uTime;
  varying vec2 vUv;

  // cover-fit a texture to the screen aspect (crop overflow, never squash)
  vec2 coverUv(vec2 uv, float texA, float screenA) {
    vec2 s = vec2(1.0);
    if (screenA > texA) s.y = texA / screenA; else s.x = screenA / texA;
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    float wipe = smoothstep(0.0, 1.0, uMix);
    // horizontal displacement that peaks mid-transition — the Amali "melt" feel
    float d = 0.03 * sin(vUv.y * 6.2831 + uTime) * wipe * (1.0 - wipe) * 2.0;
    vec3 a = texture2D(uTexA, coverUv(vUv + vec2(d, 0.0), uAspectA, uScreen)).rgb;
    vec3 b = texture2D(uTexB, coverUv(vUv - vec2(d, 0.0), uAspectB, uScreen)).rgb;
    vec3 col = mix(a, b, wipe);
    // cinematic vignette
    float vig = smoothstep(1.25, 0.35, distance(vUv, vec2(0.5)));
    col *= mix(0.9, 1.0, vig);
    gl_FragColor = vec4(col, 1.0);
  }
`

const smooth01 = (x: number) => {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

export default function FilmScroll() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)
  const [reduced, setReduced] = useState(false)
  const activeRef = useRef(0)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const mount = mountRef.current
    if (!section || !stage || !mount) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      return
    }

    const N = FILMS.length

    // ── videos (we own the timeline; kept muted + paused, scrubbed by scroll) ──
    const videos = FILMS.map((f) => {
      const v = document.createElement('video')
      v.src = f.src
      v.muted = true
      v.loop = false
      v.playsInline = true
      v.preload = 'auto'
      v.setAttribute('playsinline', '')
      v.setAttribute('muted', '')
      v.load()
      return v
    })

    const textures = videos.map((v) => {
      const t = new THREE.VideoTexture(v)
      t.minFilter = THREE.LinearFilter
      t.magFilter = THREE.LinearFilter
      t.generateMipmaps = false
      t.colorSpace = THREE.SRGBColorSpace
      return t
    })

    const aspects = FILMS.map(() => 16 / 9)
    videos.forEach((v, i) => {
      const onMeta = () => {
        if (v.videoWidth) aspects[i] = v.videoWidth / v.videoHeight
      }
      v.addEventListener('loadedmetadata', onMeta)
      // warm the decoder so scrub-seeks resolve fast, then hold on the first frame
      v.addEventListener(
        'canplay',
        () => {
          v.play().then(() => v.pause()).catch(() => {})
        },
        { once: true },
      )
    })

    // ── renderer + fullscreen shader quad ──
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.domElement.className = 'film__gl'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const uniforms = {
      uTexA: { value: textures[0] },
      uTexB: { value: textures[1] ?? textures[0] },
      uAspectA: { value: aspects[0] },
      uAspectB: { value: aspects[1] ?? aspects[0] },
      uScreen: { value: mount.clientWidth / mount.clientHeight },
      uMix: { value: 0 },
      uTime: { value: 0 },
    }
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG })
    const quad = new THREE.Mesh(geometry, material)
    scene.add(quad)

    // ── scroll wiring ──
    const progress = { current: 0 }
    let visible = false

    const syncActive = (p: number) => {
      const idx = Math.min(N - 1, Math.floor(p * N + 1e-4))
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${N * dwellFor() * window.innerHeight}`,
      pin: stage,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress.current = self.progress
        syncActive(self.progress)
      },
      onToggle: (self) => {
        visible = self.isActive
      },
    })

    const durOf = (v: HTMLVideoElement) => (v.duration && !Number.isNaN(v.duration) ? v.duration : 5)
    const seek = (v: HTMLVideoElement, t: number) => {
      if (!v.duration || Number.isNaN(v.duration)) return
      const target = Math.min(v.duration - 0.05, Math.max(0, t))
      if (v.readyState >= 2 && !v.seeking && Math.abs(v.currentTime - target) > 0.02) {
        v.currentTime = target
      }
    }

    const clock = new THREE.Clock()
    let raf = 0
    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible) return // perf gate — never render the stage while it's off-screen

      const p = progress.current
      const g = Math.min(N - 1e-4, Math.max(0, p * N))
      const idx = Math.floor(g)
      const local = g - idx
      const next = Math.min(N - 1, idx + 1)

      // scrub the active clip's timeline to scroll; hold the next clip on frame 0
      seek(videos[idx], local * durOf(videos[idx]))
      if (next !== idx) seek(videos[next], 0)

      const mix = idx >= N - 1 ? 0 : smooth01((local - (1 - TRANSITION)) / TRANSITION)

      uniforms.uTexA.value = textures[idx]
      uniforms.uTexB.value = textures[next]
      uniforms.uAspectA.value = aspects[idx]
      uniforms.uAspectB.value = aspects[next]
      uniforms.uMix.value = mix
      uniforms.uTime.value = clock.getElapsedTime()

      textures[idx].needsUpdate = true
      if (next !== idx) textures[next].needsUpdate = true
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(render)

    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      uniforms.uScreen.value = mount.clientWidth / mount.clientHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      st.kill()
      geometry.dispose()
      material.dispose()
      textures.forEach((t) => t.dispose())
      videos.forEach((v) => {
        v.pause()
        v.removeAttribute('src')
        v.load()
      })
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])

  const goTo = (i: number) => {
    const section = sectionRef.current
    if (!section) return
    const y = section.offsetTop + i * dwellFor() * window.innerHeight + 4
    const lenis = window.__lenis
    if (lenis) lenis.scrollTo(y, { duration: 1.2 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  // ── reduced-motion / no-WebGL fallback: a quiet stack of poster stills ──
  if (reduced) {
    return (
      <section className="film film--static">
        {FILMS.map((f) => (
          <article className="film__still" key={f.id}>
            <Image src={f.poster} alt={f.name} fill quality={90} sizes="100vw" />
            <div className="film__scrim" aria-hidden />
            <div className="film__cap is-active">
              <p className="label film__meta">
                {f.index} — {f.label}
              </p>
              <h2 className="film__name display">{f.name}</h2>
              <p className="film__desc">{f.desc}</p>
            </div>
          </article>
        ))}
      </section>
    )
  }

  return (
    <section className="film" ref={sectionRef} aria-label="Film tour of the house">
      <div
        className="film__stage"
        ref={stageRef}
        style={{ backgroundImage: `url(${FILMS[0].poster})` }}
      >
        <div className="film__canvas" ref={mountRef} aria-hidden />
        <div className="film__scrim" aria-hidden />

        <div className="film__ui">
          {FILMS.map((f, i) => (
            <div className={`film__cap ${i === active ? 'is-active' : ''}`} key={f.id}>
              <p className="label film__meta">
                {f.index} — {f.label}
              </p>
              <h2 className="film__name display">{f.name}</h2>
              <p className="film__desc">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="label film__counter" aria-hidden>
          {FILMS[active].index} / {String(FILMS.length).padStart(2, '0')}
        </p>

        <div className="film__track" aria-hidden>
          <span className="film__bar" ref={barRef} />
        </div>

        <nav className="film__dots" aria-label="Rooms">
          {FILMS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className={`film__dot ${i === active ? 'is-active' : ''}`}
              aria-label={f.name}
              data-label={f.name}
              onClick={() => goTo(i)}
            />
          ))}
        </nav>
      </div>
    </section>
  )
}
