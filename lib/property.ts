// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the listing.
// ⚠️ PLACEHOLDER DATA — realistic Birmingham Airbnb figures. Swap for the real
//    listing (rate, capacity, reviews, host) before going live.
// ─────────────────────────────────────────────────────────────────────────────

export interface Amenity {
  /** Inline SVG path data (24×24 viewBox) */
  icon: string
  label: string
}

export interface Review {
  name: string
  location: string
  date: string
  rating: number
  quote: string
}

export interface Property {
  name: string
  tagline: string
  location: string
  rating: number
  reviewCount: number
  superhost: boolean
  capacity: { guests: number; bedrooms: number; beds: number; baths: number }
  currency: string
  nightlyRate: number
  cleaningFee: number
  serviceFeePct: number
  minNights: number
  checkIn: string
  checkOut: string
  host: { name: string; since: number }
  contactEmail: string
  amenities: Amenity[]
  reviews: Review[]
}

export const PROPERTY: Property = {
  name: 'The Edgbaston Townhouse',
  tagline: 'A restored Victorian retreat with a cedar garden sauna & cold plunge.',
  location: 'Edgbaston, Birmingham, UK',
  rating: 4.97,
  reviewCount: 128,
  superhost: true,
  capacity: { guests: 6, bedrooms: 3, beds: 4, baths: 2 },
  currency: '£',
  nightlyRate: 245,
  cleaningFee: 65,
  serviceFeePct: 0.12,
  minNights: 2,
  checkIn: '3:00 PM',
  checkOut: '11:00 AM',
  host: { name: 'Fahad', since: 2019 },
  contactEmail: 'fahadrahman9819@gmail.com',
  amenities: [
    { label: 'Cedar barrel sauna', icon: 'M3 12h18M5 12V7a7 7 0 0114 0v5M8 12v8m8-8v8M6 20h12' },
    { label: 'Cold plunge barrel', icon: 'M4 11h16l-1.5 8.5a2 2 0 01-2 1.5H7.5a2 2 0 01-2-1.5L4 11zm2-4c1.5 1 2.5-1 4 0s2.5-1 4 0 2.5-1 4 0' },
    { label: "Chef's kitchen", icon: 'M6 3v7m0 0a2 2 0 002-2V3m-2 7v11m9-18l-2 6h4l-2-6v18' },
    { label: 'Fast Wi-Fi · 500 Mbps', icon: 'M5 12.5a10 10 0 0114 0M8 15.5a6 6 0 018 0M12 19h.01' },
    { label: 'Dedicated workspace', icon: 'M3 5h18v11H3zM3 16l3 3m15-3l-3 3M9 5V3h6v2' },
    { label: 'Free on-street parking', icon: 'M6 20V9a3 3 0 013-3h4a4 4 0 010 8H9m-3 6H4m2 0h3' },
    { label: 'Smart TV · Netflix', icon: 'M3 5h18v12H3zM8 21h8m-4-4v4' },
    { label: 'Rain shower, matte black', icon: 'M12 3v4m0 0a5 5 0 00-5 5h10a5 5 0 00-5-5zM8 16v2m4-2v3m4-3v2' },
  ],
  reviews: [
    { name: 'Amelia', location: 'London', date: 'June 2026', rating: 5, quote: 'The sauna and cold plunge at dusk made the whole trip. Photos do not do the light justice.' },
    { name: 'Marcus', location: 'Manchester', date: 'May 2026', rating: 5, quote: 'Spotless, characterful, and the kitchen is a genuine chef’s kitchen. We cooked every night.' },
    { name: 'Priya', location: 'Edinburgh', date: 'April 2026', rating: 5, quote: 'Fahad is a thoughtful host — the master suite at dawn is something else. Faultless stay.' },
  ],
}
