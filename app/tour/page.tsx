import type { Metadata } from 'next'
import Cursor from '@/components/Cursor'
import PanoramaTour from '@/components/tour/PanoramaTour'

export const metadata: Metadata = {
  title: 'Virtual Tour — The Edgbaston Townhouse',
  description:
    'Walk the townhouse room by room in 360°. Drag to look around; scroll to move from the hallway to the garden sauna.',
}

export default function TourPage() {
  return (
    <>
      <Cursor />
      <PanoramaTour />
    </>
  )
}
