'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

/**
 * Magnetic hover — the child eases toward the pointer while hovered, then springs
 * back on leave (the era-residence / award-site CTA signature). Fine-pointer only;
 * touch devices never trigger it.
 */
export default function Magnetic({
  children,
  strength = 0.4,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine)').matches) return
    const r = el.getBoundingClientRect()
    const mx = e.clientX - (r.left + r.width / 2)
    const my = e.clientY - (r.top + r.height / 2)
    gsap.to(el, { x: mx * strength, y: my * strength, duration: 0.5, ease: 'power3.out' })
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' })
  }

  return (
    <span
      ref={ref}
      className={`magnetic ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </span>
  )
}
