import Preloader from '@/components/Preloader'
import SmoothScroll from '@/components/SmoothScroll'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <main>
        <Hero />
        {/* Phase 4+ sections mount here — editorial, room chapters, details */}
        <section style={{ minHeight: '100vh' }} aria-hidden />
      </main>
    </>
  )
}
