import { PROPERTY } from '@/lib/property'
import Magnetic from './Magnetic'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span className="section__ghost footer__ghost" aria-hidden>Stay</span>
      <div className="site-footer__inner">
        <p className="eyebrow">The last word</p>
        <span className="site-footer__brand">Come and<br />stay <em>a while.</em></span>

        <Magnetic strength={0.4}>
          <a href="#book" className="btn btn--accent footer__cta">Enquire →</a>
        </Magnetic>

        <div className="site-footer__row">
          <span className="site-footer__meta">{PROPERTY.location}</span>
          <span className="site-footer__meta">© {new Date().getFullYear()} · {PROPERTY.name}</span>
          <a href="#top" className="site-footer__meta">Back to top ↑</a>
        </div>
      </div>
    </footer>
  )
}
