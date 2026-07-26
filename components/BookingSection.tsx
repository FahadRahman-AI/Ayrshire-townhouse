'use client'

import { useMemo, useState } from 'react'
import { PROPERTY } from '@/lib/property'
import Reveal from './Reveal'
import Magnetic from './Magnetic'

const {
  name, location, currency, nightlyRate, cleaningFee, serviceFeePct,
  minNights, capacity, checkIn, checkOut, host, contactEmail, rating, reviewCount,
} = PROPERTY

const fmt = (n: number) => `${currency}${n.toLocaleString('en-GB')}`
const today = () => new Date().toISOString().slice(0, 10)

const SPECS = [
  { k: 'Guests', v: capacity.guests },
  { k: 'Bedrooms', v: capacity.bedrooms },
  { k: 'Beds', v: capacity.beds },
  { k: 'Baths', v: capacity.baths },
]

export default function BookingSection() {
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [guests, setGuests] = useState(2)

  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0
    const ms = new Date(checkout).getTime() - new Date(checkin).getTime()
    return ms > 0 ? Math.round(ms / 86_400_000) : 0
  }, [checkin, checkout])

  const priced = nights >= minNights
  const subtotal = nights * nightlyRate
  const serviceFee = Math.round(subtotal * serviceFeePct)
  const total = subtotal + cleaningFee + serviceFee

  const error =
    nights > 0 && nights < minNights
      ? `Minimum stay is ${minNights} nights.`
      : checkin && checkout && nights === 0
      ? 'Check-out must be after check-in.'
      : ''

  const mailto = useMemo(() => {
    const subject = `Booking request — ${name}`
    const body = priced
      ? `Hi ${host.name},\n\nI'd like to request a stay at ${name}.\n\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nGuests: ${guests}\nNights: ${nights}\nEstimated total: ${fmt(total)}\n\nThank you!`
      : `Hi ${host.name},\n\nI'd like to enquire about availability at ${name} for ${guests} guest(s).\n\nThank you!`
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [checkin, checkout, guests, nights, total, priced])

  return (
    <section className="section booking" id="book">
      <div className="section__inner booking__inner">
        {/* ── Left: pitch + specs + host ─────────────────────────── */}
        <Reveal className="booking__pitch">
          <p className="eyebrow">Available now</p>
          <h2 className="section__title">Make it your stay.</h2>
          <p className="booking__loc">{location}</p>

          <ul className="specs">
            {SPECS.map((s) => (
              <li key={s.k} className="spec">
                <span className="spec__v">{s.v}</span>
                <span className="spec__k">{s.k}</span>
              </li>
            ))}
          </ul>

          <div className="host glass">
            <span className="host__avatar" aria-hidden>{host.name.charAt(0)}</span>
            <div>
              <p className="host__name">Hosted by {host.name}{PROPERTY.superhost ? ' · Superhost' : ''}</p>
              <p className="host__meta">Hosting since {host.since} · Check-in {checkIn} · Check-out {checkOut}</p>
            </div>
          </div>
        </Reveal>

        {/* ── Right: interactive reserve card ────────────────────── */}
        <Reveal className="reserve-card glass" delay={80}>
          <div className="reserve-card__head">
            <p className="reserve-card__price">
              {fmt(nightlyRate)} <span>/ night</span>
            </p>
            <p className="reserve-card__rating">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
                <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2 1.3-7-5-4.8 7-.9z" />
              </svg>
              {rating} · {reviewCount} reviews
            </p>
          </div>

          <div className="reserve-card__fields">
            <label className="field">
              <span>Check-in</span>
              <input type="date" min={today()} value={checkin} onChange={(e) => setCheckin(e.target.value)} />
            </label>
            <label className="field">
              <span>Check-out</span>
              <input type="date" min={checkin || today()} value={checkout} onChange={(e) => setCheckout(e.target.value)} />
            </label>
            <label className="field field--full">
              <span>Guests</span>
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                {Array.from({ length: capacity.guests }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>{g} {g === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="reserve-card__error" role="alert">{error}</p>}

          {priced && (
            <dl className="breakdown">
              <div><dt>{fmt(nightlyRate)} × {nights} nights</dt><dd>{fmt(subtotal)}</dd></div>
              <div><dt>Cleaning fee</dt><dd>{fmt(cleaningFee)}</dd></div>
              <div><dt>Service fee</dt><dd>{fmt(serviceFee)}</dd></div>
              <div className="breakdown__total"><dt>Total</dt><dd>{fmt(total)}</dd></div>
            </dl>
          )}

          <Magnetic strength={0.35} className="reserve-card__cta-wrap">
            <a className="btn btn--accent reserve-card__cta" href={mailto}>
              {priced ? 'Request to book' : 'Check availability'}
            </a>
          </Magnetic>
          <p className="reserve-card__note">You won’t be charged yet — this sends a booking request.</p>
        </Reveal>
      </div>
    </section>
  )
}
