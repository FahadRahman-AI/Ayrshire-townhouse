import { PROPERTY } from '@/lib/property'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section__inner site-footer__inner">
        <span className="site-footer__brand">{PROPERTY.name}</span>
        <span className="site-footer__meta">
          {PROPERTY.location} · © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  )
}
