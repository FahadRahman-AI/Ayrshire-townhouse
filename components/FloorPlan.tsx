'use client'

import { useEffect, useState } from 'react'

const SECTIONS = [
  {
    label: 'Outdoor',
    rooms: [
      { i: 8, name: 'Garden' },
      { i: 9, name: 'Sauna' },
    ],
  },
  {
    label: '2nd Fl.',
    rooms: [{ i: 5, name: 'Loft', full: true }],
  },
  {
    label: '1st Fl.',
    rooms: [
      { i: 1, name: 'Landing' },
      { i: 6, name: 'Shower' },
      { i: 4, name: 'Master', full: true },
    ],
  },
  {
    label: 'Ground',
    rooms: [
      { i: 0, name: 'Entrance' },
      { i: 2, name: 'Dining' },
      { i: 3, name: 'Kitchen' },
      { i: 7, name: 'Bathroom' },
    ],
  },
] as const

interface LenisInstance {
  scrollTo: (target: number, opts?: Record<string, unknown>) => void
}

function jumpTo(i: number) {
  const lenis = (window as unknown as { __lenis?: LenisInstance }).__lenis
  if (!lenis) return
  lenis.scrollTo(i * 2 * window.innerHeight, {
    duration: 1.4,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  })
}

export default function FloorPlan() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const idx = Math.min(
        Math.floor(window.scrollY / (2 * window.innerHeight)),
        9,
      )
      setActive(idx)

      // Only surface the navigator during the room walkthrough:
      // hidden on the hero (chapter 0) and once the commercial sections arrive.
      const amenities = document.querySelector('.amenities')
      const pastTour = amenities
        ? amenities.getBoundingClientRect().top < window.innerHeight * 0.6
        : false
      setVisible(idx >= 1 && !pastTour)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`fp-panel ${visible ? 'fp-panel--in' : ''}`}>
      <p className="fp-title">Floor Plan</p>

      {SECTIONS.map((sec) => (
        <div key={sec.label}>
          <p className="fp-floor-label">{sec.label}</p>
          <div className="fp-grid">
            {sec.rooms.map((room) => {
              const isActive = active === room.i
              return (
                <button
                  key={room.i}
                  className={[
                    'fp-room',
                    isActive ? 'fp-room--active' : '',
                    'full' in room && room.full ? 'fp-room--full' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => jumpTo(room.i)}
                  aria-label={`Jump to ${room.name}`}
                >
                  <span className="fp-dot" />
                  <span className="fp-name">{room.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
