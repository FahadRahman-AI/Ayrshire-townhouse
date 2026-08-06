'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTY } from '@/lib/property'

gsap.registerPlugin(ScrollTrigger)

interface Fact {
  value?: number
  pad?: number
  text?: string
  label: string
}

const FACTS: Fact[] = [
  { value: PROPERTY.capacity.guests, pad: 2, label: 'Sleeps' },
  { value: PROPERTY.capacity.bedrooms, pad: 2, label: 'Bedrooms' },
  { text: 'KA', label: 'North Ayrshire' },
  { value: PROPERTY.capacity.baths, pad: 2, label: 'Bathrooms' },
]

export default function Details() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const cells = gsap.utils.toArray<HTMLElement>('.fact', el)
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 80%' },
      })
      tl.fromTo(
        cells,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 },
        0,
      )
      cells.forEach((cell, i) => {
        const num = cell.querySelector<HTMLElement>('[data-count]')
        if (!num) return
        const end = Number(num.dataset.count)
        const pad = Number(num.dataset.pad || 0)
        const obj = { v: 0 }
        tl.to(
          obj,
          {
            v: end,
            duration: 1.2,
            ease: 'power4.inOut',
            onUpdate: () => {
              num.textContent = String(Math.round(obj.v)).padStart(pad, '0')
            },
          },
          0.15 + i * 0.1,
        )
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="details" ref={ref}>
      <div className="details__grid">
        {FACTS.map((f) => (
          <div className="fact" key={f.label}>
            <p className="fact__value display">
              {f.value != null ? (
                <span data-count={f.value} data-pad={f.pad}>
                  {String(0).padStart(f.pad || 1, '0')}
                </span>
              ) : (
                f.text
              )}
            </p>
            <p className="label fact__label">{f.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
