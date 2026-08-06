import Preloader from '@/components/Preloader'
import SmoothScroll from '@/components/SmoothScroll'
import Cursor from '@/components/Cursor'
import Hero from '@/components/Hero'
import Statement from '@/components/Statement'
import FilmScroll from '@/components/FilmScroll'
import Details from '@/components/Details'
import Enquiry from '@/components/Enquiry'
import SiteFooter from '@/components/SiteFooter'

export default function Home() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <Cursor />
      <main>
        <Hero />
        <Statement />
        <FilmScroll />
        <Details />
        <Enquiry />
        <SiteFooter />
      </main>
    </>
  )
}
