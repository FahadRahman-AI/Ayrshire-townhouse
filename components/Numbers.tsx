'use client'

import { useEffect, useRef, useState } from 'react'
import { PROPERTY } from '@/lib/property'

interface StatDef { v: number; k: string; dp?: number; prefix?: string; suffix?: string; raw?: boolean }

const STATS: StatDef[] = [
  { v: PROPERTY.capacity.guests, k: 'Guests' },
  { v: PROPERTY.capacity.bedrooms, k: 'Bedrooms' },
  { v: PROPERTY.rating, k: 'Guest rating', dp: 2 },
  { v: PROPERTY.reviewCount, k: 'Reviews' },
  { v: 500, k: 'Wi-Fi', suffix: 'Mbps' },
  { v: PROPERTY.nightlyRate, k: 'Per night', prefix: '£' },
  { v: 1898, k: 'Established', raw: true },
  { v: PROPERTY.capacity.baths, k: 'Bathrooms' },
]

function Stat({ v, k, dp = 0, prefix = '', suffix, raw = false }: StatDef) {
  const ref = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(raw ? v : 0)

  useEffect(() => {
    if (raw) return
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(v); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (t: number) => {
        const p = Math.min((t - start) / 1400, 1)
        setN(v * (1 - Math.pow(1 - p, 3)))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [v, raw])

  const disp = raw ? String(v) : dp ? n.toFixed(dp) : Math.round(n).toLocaleString('en-GB')

  return (
    <div className="stat" ref={ref}>
      <span className="stat__v">{prefix}{disp}{suffix && <span className="unit">{suffix}</span>}</span>
      <span className="stat__k">{k}</span>
    </div>
  )
}

export default function Numbers() {
  return (
    <section className="section section--deep" id="numbers">
      <div className="section__inner">
        <div className="spaces__head">
          <p className="eyebrow">02 — By the numbers</p>
          <p className="section__num">The measure of it</p>
        </div>
        <div className="numbers">
          {STATS.map((s) => <Stat key={s.k} {...s} />)}
        </div>
      </div>
    </section>
  )
}
