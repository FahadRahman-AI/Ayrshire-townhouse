import Preloader from '@/components/Preloader'
import SmoothScroll from '@/components/SmoothScroll'

export default function Home() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <main>
        {/* Phase 3+ sections mount here — hero, editorial, room chapters */}
        <section style={{ minHeight: '180vh' }} aria-hidden />
      </main>
    </>
  )
}
