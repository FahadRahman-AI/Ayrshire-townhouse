// Ordered walkthrough of the property — the camera flies through these in sequence.
export interface Room {
  file: string
  label: string
  desc: string
}

export const ROOMS: Room[] = [
  { file: '20ca4f38-0bd3-4f0f-ad2c-a4217727d3af.jpg', label: 'The Entrance', desc: 'Period cornicing, original Victorian staircase, warm globe light.' },
  { file: '3de56145-6361-437d-bd54-6d97ac46483b.jpg', label: 'The Landing',  desc: 'Fluted console, circular mirror, quiet moments between floors.' },
  { file: '20f77035-4239-4d66-8881-d52fa30fc305.jpg', label: 'Dining Room',  desc: 'Live-edge walnut, forest green drapes, dressed and ready.' },
  { file: '3fa27ae6-b981-453b-a583-3a3074b1789a.jpg', label: 'The Kitchen',  desc: 'Sage green shakers, stone worktops, copper pendants overhead.' },
  { file: 'a196322d-15bc-4067-b835-6b608af8054f.jpg', label: 'Master Suite', desc: 'Charcoal headboard, layered linen, treetop light at dawn.' },
  { file: '78d590d8-5a44-443a-a761-06356483e797.jpg', label: 'The Loft',     desc: 'Skylight above, sloped ceiling, iron ladder, clean silence.' },
  { file: '2dba1aa6-c2ac-4dd5-864a-bceed5261be1.jpg', label: 'Rain Shower',  desc: 'Honed stone tile, floor to ceiling. Matte black throughout.' },
  { file: '37ce5da1-753a-4d7b-99ab-9c788dea12e9.jpg', label: 'The Bathroom', desc: 'Glass enclosure, oval mirror, white linen, nothing extra.' },
  { file: '1db109d7-96e3-469c-801d-82496bd99949.jpg', label: 'The Garden',   desc: 'Ice barrel, cedar sauna pod, warm LED strip at dusk.' },
  { file: '265ee4f7-89c3-4d0e-b391-a144c3dd2348.jpg', label: 'The Sauna',    desc: 'Cedar lining, pine bench, bucket and ladle. Heat as ritual.' },
]

// ── Flythrough geometry (shared by the R3F scene) ─────────────────────────────
export const SPACING = 14      // world units between rooms along -Z
export const CAM_START = 8      // camera sits this far in front of a focused room
export const FOV = 60          // matches BASE_H so a focused room fills the frame
export const BASE_H = 9        // plane height in world units (width derives from aspect)
