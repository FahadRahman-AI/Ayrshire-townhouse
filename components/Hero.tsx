'use client'

import { PROPERTY } from '@/lib/property'
import { ROOMS } from '@/lib/rooms'

// Split the name so the last word sets in italic (editorial emphasis).
function HeroTitle({ name }: { name: string }) {
  const parts = name.split(' ')
  const last = parts.pop()
  return (
    <h1 className="hero__title" id="top">
      {parts.join(' ')} <em>{last}</em>
    </h1>
  )
}

export default function Hero() {
  const hero = ROOMS[3] // the kitchen — bright, architectural depth
  return (
    <section className="hero">
      <p className="hero__eyebrow">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden>
          <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2 1.3-7-5-4.8 7-.9z" />
        </svg>
        {PROPERTY.rating} · {PROPERTY.reviewCount} reviews{PROPERTY.superhost ? ' · Superhost' : ''}
      </p>

      <HeroTitle name={PROPERTY.name} />

      <div className="hero__media">
        <img src={`/images/${hero.file}`} alt={`${PROPERTY.name} — ${hero.label}`} />
      </div>

      <div className="hero__foot">
        <p className="hero__tagline">{PROPERTY.tagline}</p>
        <p className="hero__loc">{PROPERTY.location}</p>
      </div>
    </section>
  )
}
