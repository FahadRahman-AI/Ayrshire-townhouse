'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: 'var(--pad)',
      }}
    >
      <div>
        <p className="label" style={{ color: 'var(--ink-60)', marginBottom: '1.2rem' }}>
          Something went wrong
        </p>
        <h1 className="display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', marginBottom: '2rem' }}>
          We hit a snag loading the page.
        </h1>
        <button
          type="button"
          onClick={reset}
          className="label"
          style={{
            background: 'none',
            border: '1px solid var(--ink-10)',
            padding: '0.9rem 1.8rem',
            borderRadius: '999px',
            color: 'var(--ink)',
          }}
        >
          Try again
        </button>
      </div>
    </main>
  )
}
