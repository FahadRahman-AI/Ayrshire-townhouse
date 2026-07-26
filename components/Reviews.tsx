'use client'

import { PROPERTY } from '@/lib/property'
import Reveal from './Reveal'

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="12" height="12" fill={i < n ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2 1.3-7-5-4.8 7-.9z" />
        </svg>
      ))}
    </span>
  )
}

export default function Reviews() {
  const { rating, reviewCount, superhost } = PROPERTY

  return (
    <section className="section reviews" id="reviews">
      <div className="section__inner">
        <Reveal className="reviews__head">
          <p className="eyebrow">Guest reviews</p>
          <h2 className="section__title">
            <span className="reviews__score">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
                <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2 1.3-7-5-4.8 7-.9z" />
              </svg>
              {rating}
            </span>
            · {reviewCount} reviews{superhost ? ' · Superhost' : ''}
          </h2>
        </Reveal>

        <div className="reviews__grid">
          {PROPERTY.reviews.map((r, i) => (
            <Reveal as="article" key={r.name} className="review glass" delay={i * 70}>
              <Stars n={r.rating} />
              <p className="review__quote">“{r.quote}”</p>
              <p className="review__by">
                <strong>{r.name}</strong>
                <span>{r.location} · {r.date}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
