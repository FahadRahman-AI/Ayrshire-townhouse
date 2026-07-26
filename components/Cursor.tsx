'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // No custom cursor on touch / coarse-pointer devices — native cursor stays.
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot = dotRef.current!
    let tx = -100
    let ty = -100
    let cx = -100
    let cy = -100
    let vx = 0
    let vy = 0
    let raf = 0
    let last = performance.now()

    // Critically-damped spring — physics-based follow, no overshoot
    const STIFFNESS = 170
    const DAMPING = 26

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      const ax = STIFFNESS * (tx - cx) - DAMPING * vx
      const ay = STIFFNESS * (ty - cy) - DAMPING * vy
      vx += ax * dt
      vy += ay * dt
      cx += vx * dt
      cy += vy * dt
      gsap.set(dot, { x: cx, y: cy })
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={dotRef} className="cursor" aria-hidden />
}
