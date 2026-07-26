import * as THREE from 'three'
import { ROOMS, SPACING } from './rooms'

// ─────────────────────────────────────────────────────────────────────────────
// Flythrough spline (Amali technique). A single Catmull–Rom curve serves two
// masters: it is the exact set of positions the room planes sit at, AND the path
// the camera flies. Because both derive from the same points, the camera always
// arrives head-on to each room even as the line drifts left/right and rises/falls.
// ─────────────────────────────────────────────────────────────────────────────

/** Gentle lateral sway + vertical lift per room — the "S" the camera banks through. */
export const ROOM_POINTS: THREE.Vector3[] = ROOMS.map((_, i) =>
  new THREE.Vector3(
    Math.sin(i * 0.6) * 1.2,   // gentle drift left/right (kept subtle for full-bleed)
    Math.cos(i * 0.4) * 0.5,   // subtle rise/fall
    -i * SPACING,              // primary travel axis
  ),
)

/** The smooth path through those points; low tension keeps the drift cinematic. */
export const ROOM_CURVE = new THREE.CatmullRomCurve3(
  ROOM_POINTS,
  false,        // open curve
  'catmullrom',
  0.5,          // tension
)

/** Normalised curve parameter (0..1) at which room `i` is perfectly framed. */
export const roomT = (i: number) => i / (ROOMS.length - 1)
