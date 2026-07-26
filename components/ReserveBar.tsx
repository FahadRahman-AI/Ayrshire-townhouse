'use client'

import { useEffect, useState } from 'react'
import { PROPERTY } from '@/lib/property'
import Magnetic from './Magnetic'

interface LenisInstance {
  scrollTo: (target: string | number | HTMLElement, opts?: Record<string, unknown>) => void
}

function scrollToBooking() {
  const el = document.getElementById('book')
  if (!el) return
  const lenis = (window as unknown as { __lenis?: LenisInstance }).__lenis
  if (lenis) lenis.scrollTo(el, { duration: 1.4, offset: 0 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export default function ReserveBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Reveal after the first screen so it doesn't fight the hero
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { currency, nightlyRate, rating, reviewCount } = PROPERTY

  return (
    <div className={`reserve-bar ${visible ? 'reserve-bar--in' : ''}`}>
      <div className="reserve-bar__meta">
        <span className="reserve-bar__price">
          {currency}
          {nightlyRate}
          <span className="reserve-bar__unit"> / night</span>
        </span>
        <span className="reserve-bar__rating" aria-label={`Rated ${rating} out of 5`}>
          <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden>
            <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2 1.3-7-5-4.8 7-.9z" />
          </svg>
          {rating} · {reviewCount}
        </span>
      </div>
      <Magnetic strength={0.5}>
        <button type="button" className="btn btn--accent reserve-bar__cta" onClick={scrollToBooking}>
          Reserve
        </button>
      </Magnetic>
    </div>
  )
}
