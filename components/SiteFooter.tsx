import { PROPERTY } from '@/lib/property'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__brand">Come and<br />stay a while.</span>
        <div className="site-footer__row">
          <span className="site-footer__meta">{PROPERTY.location}</span>
          <span className="site-footer__meta">© {new Date().getFullYear()} · {PROPERTY.name}</span>
          <span className="site-footer__meta">Crafted with care</span>
        </div>
      </div>
    </footer>
  )
}
