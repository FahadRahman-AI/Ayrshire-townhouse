'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'

/** Lerps its child ≤8px toward the cursor within 100px proximity; springs back. */
export default function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return
    const target = el.firstElementChild as HTMLElement | null
    if (!target) return

    const xTo = gsap.quickTo(target, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(target, 'y', { duration: 0.4, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      const reach = Math.max(r.width, r.height) / 2 + 100
      if (dist < reach) {
        const pull = Math.min(8, dist * 0.12)
        const ang = Math.atan2(dy, dx)
        xTo(Math.cos(ang) * pull)
        yTo(Math.sin(ang) * pull)
      } else {
        xTo(0)
        yTo(0)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return <div ref={ref}>{children}</div>
}
