'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Chars from './Chars'

gsap.registerPlugin(ScrollTrigger)

export interface Room {
  id: string
  index: string
  label: string
  name: string
  img: string
  alt: string
  desc: string
}

export const ROOMS: Room[] = [
  {
    id: 'dining',
    index: '01',
    label: 'Arrival',
    name: 'The Dining Room',
    img: '/photos/dining-room.jpg',
    alt: 'Walnut dining table set for six beneath a linen pendant, kitchen beyond',
    desc: 'Walnut, linen and morning light — breakfast for six under the original cornicing.',
  },
  {
    id: 'kitchen',
    index: '02',
    label: 'The Kitchen',
    name: 'The Kitchen',
    img: '/photos/kitchen.jpg',
    alt: 'Sage-green chef’s kitchen with brass pendants and a long prep counter',
    desc: 'Sage cabinetry, brass light and counter enough to cook properly.',
  },
  {
    id: 'master',
    index: '03',
    label: 'The Master',
    name: 'The Master Suite',
    img: '/photos/master-bedroom.jpg',
    alt: 'Dormer-ceilinged master bedroom, quilted throw and a window full of trees',
    desc: 'Dormer ceilings, deep carpet and a window full of trees at first light.',
  },
  {
    id: 'snug',
    index: '04',
    label: 'The Snug',
    name: 'The Snug',
    img: '/photos/snug-bedroom.jpg',
    alt: 'Small single bedroom under the eaves with a skylight over white linen',
    desc: 'A single under the eaves — small, quiet and warm beneath the skylight.',
  },
]

// Scroll geometry: each chapter dwells for DWELL viewport-heights of scroll;
// the incoming wipe rides the final WIPE fraction of the outgoing dwell.
const DWELL = 1.6 // 100vh pinned + 60vh scrub
const WIPE = 0.32 // final 20% of the dwell

export default function Chapters() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const layers = gsap.utils.toArray<HTMLElement>('.chapter', el)
    const total = ROOMS.length * DWELL

    const ctx = gsap.context(() => {
      if (reduced) return

      // ── master scrubbed timeline: wipes + Ken Burns + progress fill ──
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${total * window.innerHeight}`,
          pin: '.chapters__stage',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      layers.forEach((layer, i) => {
        const media = layer.querySelector('.chapter__media')
        const ui = layer.querySelector('.chapter__ui')
        const from = i === 0 ? 0 : i * DWELL - WIPE // wipe-in start
        const until = (i + 1) * DWELL // wipe-out end (or tour end)

        if (i > 0) {
          gsap.set(layer, { clipPath: 'inset(0 0 0 100%)' })
          tl.to(layer, { clipPath: 'inset(0 0 0 0%)', duration: WIPE, ease: 'power4.inOut' }, from)
        }

        // Ken Burns across the chapter's whole visible span, drift alternating
        tl.fromTo(
          media,
          { scale: 1, x: 0 },
          { scale: 1.1, x: i % 2 ? '-2.5%' : '2.5%', duration: until - from },
          from,
        )
        // foreground UI parallaxes at a slower rate than the image
        tl.fromTo(ui, { y: 24 }, { y: -24, duration: until - from }, from)
      })

      tl.fromTo('.chapters__bar', { scaleY: 0 }, { scaleY: 1, duration: total }, 0)

      // ── per-chapter UI reveals: play on entry, reverse on exit ──
      layers.forEach((layer, i) => {
        const chars = layer.querySelectorAll('.char')
        const uiTl = gsap
          .timeline({ paused: true })
          .fromTo(
            layer.querySelectorAll('.chapter__meta'),
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
            0,
          )
          .fromTo(
            chars,
            { yPercent: 110 },
            { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.03 },
            0.05,
          )
          .fromTo(
            layer.querySelector('.chapter__desc'),
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: 'power3.out' },
            '-=0.55',
          )

        ScrollTrigger.create({
          trigger: el,
          start: () => `top+=${Math.max(0, (i * DWELL - WIPE / 2)) * window.innerHeight - window.innerHeight * 0.4} top`,
          end: () => `top+=${((i + 1) * DWELL - WIPE / 2) * window.innerHeight} top`,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            if (self.isActive) {
              uiTl.play()
              activeRef.current = i
              setActive(i)
            } else if (self.direction < 0) {
              uiTl.reverse()
            }
          },
        })
      })
    }, el)

    return () => ctx.revert()
  }, [])

  const goTo = (i: number) => {
    const el = ref.current
    if (!el) return
    const lenis = window.__lenis
    const y = el.offsetTop + (i === 0 ? 0 : (i * DWELL - WIPE / 2) * window.innerHeight + 2)
    if (lenis) lenis.scrollTo(y, { duration: 1.2 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <section className="chapters" ref={ref}>
      <div className="chapters__stage">
        {ROOMS.map((room) => (
          <article className="chapter" key={room.id} aria-label={room.name}>
            <div className="chapter__media">
              <Image src={room.img} alt={room.alt} fill quality={100} sizes="100vw" />
            </div>
            <div className="chapter__scrim" aria-hidden />
            <div className="chapter__ui">
              <p className="label chapter__meta">
                {room.index} — {room.label}
              </p>
              <h2 className="chapter__name display" aria-label={room.name}>
                <Chars text={room.name} />
              </h2>
              <p className="chapter__desc">{room.desc}</p>
            </div>
          </article>
        ))}

        <p className="label chapters__counter" aria-hidden>
          {ROOMS[active].index} / {String(ROOMS.length).padStart(2, '0')}
        </p>

        <div className="chapters__track" aria-hidden>
          <span className="chapters__bar" />
        </div>

        <nav className="chapters__dots" aria-label="Rooms">
          {ROOMS.map((room, i) => (
            <button
              key={room.id}
              type="button"
              className={`chapters__dot ${i === active ? 'is-active' : ''}`}
              aria-label={room.name}
              data-label={room.name}
              onClick={() => goTo(i)}
            />
          ))}
        </nav>
      </div>
    </section>
  )
}
