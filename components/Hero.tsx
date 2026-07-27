'use client'

import { useEffect, useRef } from 'react'
import { PROPERTY } from '@/lib/property'
import Marquee from './Marquee'

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const parts = PROPERTY.name.split(' ')
  const last = parts.pop()
  const attrs = [
    'Cedar barrel sauna',
    'Cold plunge',
    "Chef's kitchen",
    '500 Mbps',
    'Sleeps six',
    'Edgbaston · Birmingham',
    'Est. 1898',
    'Superhost',
  ]

  // Cursor-reactive parallax — watermark and title drift subtly, opposite ways.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: PointerEvent) => {
      const cx = e.clientX / window.innerWidth - 0.5
      const cy = e.clientY / window.innerHeight - 0.5
      el.style.setProperty('--wx', `${cx * 40}px`)
      el.style.setProperty('--wy', `${cy * 28}px`)
      el.style.setProperty('--tx', `${cx * -14}px`)
      el.style.setProperty('--ty', `${cy * -10}px`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <section className="hero" id="top" ref={ref}>
      <span className="hero__watermark" aria-hidden>1898</span>

      <p className="eyebrow hero__eyebrow">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden>
          <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2 1.3-7-5-4.8 7-.9z" />
        </svg>
        {PROPERTY.rating} · {PROPERTY.reviewCount} reviews{PROPERTY.superhost ? ' · Superhost' : ''}
      </p>

      <h1 className="hero__title">
        {parts.join(' ')} <em>{last}</em>
      </h1>

      <div className="hero__row">
        <p className="hero__tagline">{PROPERTY.tagline}</p>
        <span className="hero__scrollcue">Scroll<span /></span>
      </div>

      <Marquee items={attrs} />
    </section>
  )
}
