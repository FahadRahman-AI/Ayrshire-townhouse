import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://property-tour.vercel.app'
// TODO: point at the real lead photograph once the photography lands in /public
const HERO_IMAGE = '/og.jpg'

// Display face — a modern, minimal grotesque. Replaces the former Fraunces serif.
const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'The Ayrshire Townhouse — North Ayrshire Airbnb',
  description:
    'Book a restored townhouse in North Ayrshire, Scotland — sage kitchen, garden cedar sauna and cold plunge. Superhost · 4.97★.',
  keywords: [
    'North Ayrshire Airbnb',
    'Ayrshire holiday let',
    'North Ayrshire short stay',
    'luxury Airbnb Scotland',
    'sauna Airbnb Scotland',
    'book a stay Ayrshire',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'The Ayrshire Townhouse',
    title: 'The Ayrshire Townhouse — a North Ayrshire stay',
    description:
      'A restored Scottish townhouse: sage kitchen, garden cedar sauna and cold plunge. Superhost · 4.97★ · from £245/night.',
    locale: 'en_GB',
    images: [
      {
        url: HERO_IMAGE,
        width: 1200,
        height: 630,
        alt: 'The Ayrshire Townhouse — the garden at dusk with cedar sauna and cold plunge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Ayrshire Townhouse — a North Ayrshire stay',
    description:
      'A restored Scottish townhouse with a cedar garden sauna & cold plunge. Superhost · 4.97★ · from £245/night.',
    images: [HERO_IMAGE],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f1efeb',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${inter.variable}`}>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  )
}
