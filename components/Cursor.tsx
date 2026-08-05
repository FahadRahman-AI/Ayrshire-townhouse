'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/** 6px ink dot (instant) + 32px ring (lerped); ring doubles over interactives. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.documentElement.classList.add('has-cursor')
    const xTo = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })
    let shown = false

    const onMove = (e: PointerEvent) => {
      if (!shown) {
        shown = true
        gsap.set([dot, ring], { opacity: 1 })
        gsap.set(ring, { x: e.clientX, y: e.clientY })
      }
      gsap.set(dot, { x: e.clientX, y: e.clientY })
      xTo(e.clientX)
      yTo(e.clientY)
      const interactive = (e.target as Element | null)?.closest?.('a, button')
      gsap.to(ring, { scale: interactive ? 2 : 1, duration: 0.35, ease: 'power3.out' })
    }
    const onLeave = () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 })
    const onEnter = () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 })

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.documentElement.addEventListener('pointerenter', onEnter)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.documentElement.removeEventListener('pointerenter', onEnter)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden />
      <div className="cursor-ring" ref={ringRef} aria-hidden />
    </>
  )
}
