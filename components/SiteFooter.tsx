import { PROPERTY } from '@/lib/property'

export default function SiteFooter() {
  return (
    <footer className="footer">
      <p className="footer__item">{PROPERTY.name}</p>
      <p className="footer__item footer__item--muted">{PROPERTY.location}</p>
      <a className="footer__item footer__item--muted u-link" href={`mailto:${PROPERTY.contactEmail}`}>
        Hosted by {PROPERTY.host.name} · since {PROPERTY.host.since}
      </a>
    </footer>
  )
}
