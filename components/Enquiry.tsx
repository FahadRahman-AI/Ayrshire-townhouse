'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTY } from '@/lib/property'
import Magnetic from './Magnetic'

gsap.registerPlugin(ScrollTrigger)

const LINES = ['Enquire about', 'this stay.']

export default function Enquiry() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 75%' },
      })
      tl.fromTo(
        '.enquiry__line .mask__inner',
        { yPercent: 110 },
        { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12 },
        0,
      )
      tl.fromTo(
        '.enquiry__cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        0.5,
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="enquiry" ref={ref}>
      <h2 className="enquiry__text display">
        {LINES.map((line) => (
          <span className="mask enquiry__line" key={line}>
            <span className="mask__inner">{line}</span>
          </span>
        ))}
      </h2>
      <div className="enquiry__cta">
        <Magnetic>
          <a className="btn-pill" href={PROPERTY.enquiryUrl}>
            <span className="btn-pill__fill" aria-hidden />
            <span className="btn-pill__text label">Check availability</span>
          </a>
        </Magnetic>
      </div>
    </section>
  )
}
