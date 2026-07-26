'use client'

import { PROPERTY } from '@/lib/property'
import Magnetic from './Magnetic'

export default function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="nav__mark">{PROPERTY.name}</a>
      <nav className="nav__links">
        <a href="#spaces">Spaces</a>
        <a href="#amenities">Amenities</a>
        <a href="#reviews">Reviews</a>
        <Magnetic strength={0.4}>
          <a href="#book" className="nav__cta">Enquire</a>
        </Magnetic>
      </nav>
    </header>
  )
}
