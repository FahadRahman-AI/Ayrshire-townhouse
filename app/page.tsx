import Preloader from '@/components/Preloader'
import SmoothScroll from '@/components/SmoothScroll'
import Hero from '@/components/Hero'
import Statement from '@/components/Statement'

export default function Home() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <main>
        <Hero />
        <Statement />
        {/* Phase 5+ sections mount here — room chapters, details, enquiry */}
      </main>
    </>
  )
}
