'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { PROPERTY } from '@/lib/property'
import Chars from './Chars'

const LINES = ['The Ayrshire', 'Townhouse']

export default function Hero() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const chars = el.querySelectorAll<HTMLElement>('.char')
    const fades = el.querySelectorAll<HTMLElement>('.hero__fade')
    const media = el.querySelector<HTMLElement>('.hero__media')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.set(chars, { yPercent: 110 })
    gsap.set(fades, { opacity: 0, y: 10 })
    gsap.set(media, { scale: 1.06 })

    let played = false
    const play = () => {
      if (played) return
      played = true
      gsap.to(media, { scale: 1, duration: 2, ease: 'power3.out' })
      gsap.to(chars, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.03, delay: 0.1 })
      gsap.to(fades, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.7, stagger: 0.1 })
    }

    window.addEventListener('preloader:exit', play)
    const fallback = setTimeout(play, 4500)
    return () => {
      window.removeEventListener('preloader:exit', play)
      clearTimeout(fallback)
    }
  }, [])

  return (
    <section className="hero" ref={ref}>
      <div className="hero__media">
        <video
          className="hero__video"
          poster="/Videos/posters/film-2.jpg"
          src="/Videos/film-2.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="The garden at dusk — cedar sauna and cold-plunge barrels under warm fence light"
        />
      </div>

      <div className="hero__scrim" aria-hidden />

      <p className="label hero__corner hero__corner--left hero__fade">North Ayrshire · Scotland</p>
      <p className="label hero__corner hero__corner--right hero__fade">Entire home</p>

      <h1 className="hero__title display" aria-label={PROPERTY.name}>
        {LINES.map((line) => (
          <span className="hero__line" key={line}>
            <Chars text={line} />
          </span>
        ))}
      </h1>

      <div className="hero__cue hero__fade" aria-hidden>
        <span className="label">Scroll to explore</span>
        <span className="hero__cue-line" />
      </div>
    </section>
  )
}
