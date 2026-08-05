import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://property-tour.vercel.app'
// TODO: point at the real lead photograph once the photography lands in /public
const HERO_IMAGE = '/og.jpg'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'The Edgbaston Townhouse — Birmingham Airbnb',
  description:
    'Book a restored Victorian townhouse in Edgbaston, Birmingham — 3 bedrooms, chef’s kitchen, cedar garden sauna and cold plunge. Superhost · 4.97★.',
  keywords: [
    'Birmingham Airbnb',
    'Edgbaston holiday let',
    'Birmingham short stay',
    'luxury Airbnb Birmingham',
    'sauna Airbnb UK',
    'book a stay Birmingham',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'The Edgbaston Townhouse',
    title: 'The Edgbaston Townhouse — a Birmingham stay',
    description:
      'A restored Victorian retreat: 3 bedrooms, chef’s kitchen, cedar garden sauna and cold plunge. Superhost · 4.97★ · from £245/night.',
    locale: 'en_GB',
    images: [
      {
        url: HERO_IMAGE,
        width: 1200,
        height: 630,
        alt: 'The Edgbaston Townhouse — Victorian entrance with original staircase',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Edgbaston Townhouse — a Birmingham stay',
    description:
      'A restored Victorian retreat with cedar garden sauna & cold plunge. Superhost · 4.97★ · from £245/night.',
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
      <body className={`${fraunces.variable} ${inter.variable}`}>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  )
}
