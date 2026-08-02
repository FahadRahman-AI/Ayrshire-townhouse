'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<{ active: boolean; label: string }>({ active: false, label: '' })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const el = dot.current!
    let tx = -100, ty = -100, cx = -100, cy = -100, vx = 0, vy = 0, raf = 0, last = performance.now()
    const STIFF = 170, DAMP = 26

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30); last = now
      vx += (STIFF * (tx - cx) - DAMP * vx) * dt
      vy += (STIFF * (ty - cy) - DAMP * vy) * dt
      cx += vx * dt; cy += vy * dt
      gsap.set(el, { x: cx, y: cy, xPercent: -50, yPercent: -50 })
      raf = requestAnimationFrame(tick)
    }
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest('.space-row, a, button') as HTMLElement | null
      if (!t) { setState({ active: false, label: '' }); return }
      let label = ''
      if (t.matches('.space-row')) label = 'View'
      else if (t.closest('.tour-invite__link')) label = 'Enter'
      else if (t.closest('.nav__cta, .reserve-card__cta, .btn--accent')) label = 'Enquire'
      setState({ active: true, label })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <div ref={dot} className={`cursor ${state.active ? 'cursor--active' : ''} ${state.label ? 'cursor--label' : ''}`} aria-hidden>
      <span className="cursor__label">{state.label}</span>
    </div>
  )
}
