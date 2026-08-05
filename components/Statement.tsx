'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LINES = [
  'An 1898 townhouse,',
  'restored to its bones —',
  'evenings end in cedar',
  'and cold water.',
]

export default function Statement() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 80%' },
      })
      tl.fromTo('.statement__rule', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.out' })
      tl.fromTo(
        '.statement__line .mask__inner',
        { yPercent: 110 },
        { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12 },
        0.15,
      )
      tl.fromTo(
        '.statement__col',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15 },
        0.6,
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="statement" ref={ref}>
      <span className="statement__rule" aria-hidden />
      <h2 className="statement__text display">
        {LINES.map((line) => (
          <span className="mask statement__line" key={line}>
            <span className="mask__inner">{line}</span>
          </span>
        ))}
      </h2>
      <div className="statement__cols">
        <p className="statement__col">
          Three bedrooms, a chef&rsquo;s kitchen and a dining room that keeps its Victorian
          proportions — six guests, five minutes from the botanical gardens.
        </p>
        <p className="statement__col">
          In the garden: a cedar barrel sauna, a cold plunge and low fence-light. The ritual is
          simple — heat, cold, night air, repeat.
        </p>
      </div>
    </section>
  )
}
