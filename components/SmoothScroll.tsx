'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface LenisInstance {
  raf: (time: number) => void
  on: (event: string, cb: () => void) => void
  scrollTo: (target: string | number | HTMLElement, opts?: Record<string, unknown>) => void
  destroy: () => void
}
interface LenisConstructor { new (opts: Record<string, unknown>): LenisInstance }

/**
 * Page-wide inertial smooth scroll. The 3D camera reads window.scrollY, which
 * Lenis drives natively, so the flythrough inherits the buttery easing.
 * Exposes __lenis (FloorPlan jump navigation) and __forceScroll (tests).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new (Lenis as unknown as LenisConstructor)({
      duration: 1.25,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })

    const w = window as unknown as Record<string, unknown>
    w.__lenis = lenis
    w.__forceScroll = (y: number) => lenis.scrollTo(y, { immediate: true, force: true })

    // Bridge Lenis → GSAP: one shared rAF/timeline so ScrollTrigger scrubs ride the
    // same inertial scroll as the 3D camera — no desync, no second smoothing loop.
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      delete w.__lenis
      delete w.__forceScroll
    }
  }, [])

  return null
}
