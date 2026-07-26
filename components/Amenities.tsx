'use client'

import { PROPERTY } from '@/lib/property'
import Reveal from './Reveal'

export default function Amenities() {
  return (
    <section className="section section--alt amenities" id="amenities">
      <div className="section__inner">
        <Reveal>
          <p className="eyebrow">Everything you need</p>
          <h2 className="section__title">Designed for a longer stay.</h2>
        </Reveal>

        <ul className="amenities__grid">
          {PROPERTY.amenities.map((a, i) => (
            <Reveal as="li" key={a.label} className="amenity" delay={i * 45}>
              <span className="amenity__icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={a.icon} />
                </svg>
              </span>
              <span className="amenity__label">{a.label}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
