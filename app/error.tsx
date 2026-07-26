'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="boundary">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="section__title">We hit a snag loading the tour.</h1>
        <button type="button" className="btn btn--accent" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  )
}
