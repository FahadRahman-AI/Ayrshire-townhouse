// The tour's single source of truth: one entry per equirectangular panorama
// in public/panoramas/. Order here is tour order.

export interface TourRoom {
  slug: string
  name: string
  /** Micro-label above the room name (Inter, letterspaced). */
  eyebrow: string
  panorama: string
  /** Initial camera yaw (radians) so each room opens on its best angle. */
  startYaw: number
}

export const ROOMS: TourRoom[] = [
  {
    slug: 'hallway',
    name: 'The Hallway',
    eyebrow: 'Arrival · 01',
    panorama: '/panoramas/01-hallway.jpg',
    startYaw: 0,
  },
  {
    slug: 'drawing-room',
    name: 'The Drawing Room',
    eyebrow: 'Reception · 02',
    panorama: '/panoramas/02-drawing-room.jpg',
    startYaw: 3.1,
  },
  {
    slug: 'kitchen',
    name: 'The Kitchen',
    eyebrow: 'Cook & Gather · 03',
    panorama: '/panoramas/03-kitchen.jpg',
    startYaw: 2.41,
  },
  {
    slug: 'bedroom',
    name: 'The Principal Bedroom',
    eyebrow: 'Rest · 04',
    panorama: '/panoramas/04-bedroom.jpg',
    startYaw: 3.02,
  },
  {
    slug: 'garden-sauna',
    name: 'The Garden Sauna',
    eyebrow: 'Ritual · 05',
    panorama: '/panoramas/05-garden-sauna.jpg',
    startYaw: 1.57,
  },
]
