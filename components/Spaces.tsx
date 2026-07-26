'use client'

import { ROOMS } from '@/lib/rooms'
import Reveal from './Reveal'

export default function Spaces() {
  return (
    <section className="section spaces" id="spaces">
      <div className="spaces__intro">
        <Reveal>
          <p className="eyebrow">The spaces</p>
          <h2 className="section__title">Ten rooms,<br />one considered whole.</h2>
        </Reveal>
      </div>

      <div className="spaces__list">
        {ROOMS.map((room, i) => (
          <Reveal as="article" key={room.file} className={`space ${i % 2 ? 'space--alt' : ''}`}>
            <div className="space__media">
              <img src={`/images/${room.file}`} alt={room.label} loading="lazy" />
            </div>
            <div className="space__text">
              <span className="space__num">{String(i + 1).padStart(2, '0')} — {String(ROOMS.length).padStart(2, '0')}</span>
              <h3 className="space__name">{room.label}</h3>
              <p className="space__desc">{room.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
