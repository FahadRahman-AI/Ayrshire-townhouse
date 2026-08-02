import Reveal from './Reveal'

/** Interstitial band after the room list — the doorway into /tour. */
export default function TourInvite() {
  return (
    <section className="section section--deep tour-invite">
      <div className="section__inner">
        <Reveal as="div">
          <a className="tour-invite__link" href="/tour">
            <span className="tour-invite__title serif">
              Step <em>inside</em>
              <span className="tour-invite__arrow" aria-hidden> →</span>
            </span>
            <span className="tour-invite__sub">The 360° walkthrough — five rooms, drag to look around</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
