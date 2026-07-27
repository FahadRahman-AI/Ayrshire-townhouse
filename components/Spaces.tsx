'use client'

import { ROOMS } from '@/lib/rooms'
import Reveal from './Reveal'

export default function Spaces() {
  return (
    <section className="section section--clip spaces" id="spaces">
      <span className="section__ghost section__ghost--spaces" aria-hidden>Rooms</span>
      <div className="section__inner">
        <div className="spaces__head">
          <p className="eyebrow">01 — The spaces</p>
          <p className="section__num">{ROOMS.length} rooms</p>
        </div>
        <h2 className="section__title serif">Ten rooms,<br />one considered whole.</h2>

        <div className="spaces__list">
          {ROOMS.map((room, i) => (
            <Reveal as="div" key={room.file} className="space-row">
              <span className="space-row__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="space-row__name">{room.label}</span>
              <span className="space-row__desc">{room.desc}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
