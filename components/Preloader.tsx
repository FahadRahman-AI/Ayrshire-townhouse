'use client'

import { useEffect, useState } from 'react'

export default function Preloader() {
  const [p, setP] = useState(0)
  const [done, setDone] = useState(false)
  const [hide, setHide] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('et-loaded')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (seen || reduce) { setHide(true); return }

    document.body.style.overflow = 'hidden'
    const start = performance.now()
    const dur = 2000
    let raf = 0
    const tick = (t: number) => {
      const prog = Math.min((t - start) / dur, 1)
      setP(Math.round((1 - Math.pow(1 - prog, 2)) * 100))
      if (prog < 1) raf = requestAnimationFrame(tick)
      else {
        setDone(true)
        sessionStorage.setItem('et-loaded', '1')
        document.body.style.overflow = ''
        setTimeout(() => setHide(true), 1100)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = '' }
  }, [])

  if (hide) return null

  return (
    <div className={`preloader ${done ? 'preloader--done' : ''}`} aria-hidden>
      <span className="preloader__name">The Edgbaston Townhouse</span>
      <span className="preloader__count">{String(p).padStart(3, '0')}</span>
      <span className="preloader__meta">Edgbaston · Birmingham</span>
      <span className="preloader__bar" style={{ width: `${p}%` }} />
    </div>
  )
}
