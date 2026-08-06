// Ordered as an editorial walk-through of the house, ending at the garden at dusk.
// Each clip is scroll-scrubbed (its timeline is driven by scroll position) and
// shader-dissolved into the next inside <FilmScroll>.
export interface Film {
  id: string
  index: string
  label: string
  name: string
  src: string
  poster: string
  desc: string
}

export const FILMS: Film[] = [
  {
    id: 'drawing',
    index: '01',
    label: 'Arrival',
    name: 'The Drawing Room',
    src: '/Videos/film-1.mp4',
    poster: '/Videos/posters/film-1.jpg',
    desc: 'Through the doorway — a bay window, original cornicing and the low chairs where morning light lands.',
  },
  {
    id: 'kitchen',
    index: '02',
    label: 'The Kitchen',
    name: 'The Kitchen',
    src: '/Videos/film-5.mp4',
    poster: '/Videos/posters/film-5.jpg',
    desc: 'Sage cabinetry, a run of counter and enough room to cook something properly.',
  },
  {
    id: 'bedroom',
    index: '03',
    label: 'The Bedroom',
    name: 'The Bedroom',
    src: '/Videos/film-4.mp4',
    poster: '/Videos/posters/film-4.jpg',
    desc: 'Deep carpet, quiet linen and a window full of trees at first light.',
  },
  {
    id: 'wetroom',
    index: '04',
    label: 'The Wet Room',
    name: 'The Wet Room',
    src: '/Videos/film-3.mp4',
    poster: '/Videos/posters/film-3.jpg',
    desc: 'Poured stone and blackened brass — a walk-in shower built to hotel grade.',
  },
  {
    id: 'garden',
    index: '05',
    label: 'The Garden',
    name: 'The Garden',
    src: '/Videos/film-2.mp4',
    poster: '/Videos/posters/film-2.jpg',
    desc: 'Cedar sauna and a cold-plunge barrel, warm under the fence light as the day goes down.',
  },
]
