import SmoothScroll from '@/components/SmoothScroll'
import Cursor from '@/components/Cursor'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Spaces from '@/components/Spaces'
import Amenities from '@/components/Amenities'
import Reviews from '@/components/Reviews'
import BookingSection from '@/components/BookingSection'
import SiteFooter from '@/components/SiteFooter'

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Spaces />
        <Amenities />
        <Reviews />
        <BookingSection />
        <SiteFooter />
      </main>
    </>
  )
}
