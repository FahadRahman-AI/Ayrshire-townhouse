# The Ayrshire Townhouse — property tour

An editorial site for a restored stay in North Ayrshire, Scotland. Warm ivory
canvas, colossal modern display type, film grain, and a scroll-scrubbed video
tour of the rooms — the footage is the hero; type, colour and motion serve it.

**Stack (exact):** Next.js 14 (App Router) · GSAP + ScrollTrigger · Lenis · CSS.
No Three.js. Fraunces (display) / Inter (body) via `next/font`.

## Develop

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Verify visually — mandatory before calling anything done

```bash
node screenshot.js             # full-page shot → screenshots/latest.png (1440w)
node screenshot.js --mobile    # + 390w mobile shot
node screenshot.js --path=/x   # capture a specific route
node screenshot.js --delay=800 # viewport shot N ms after load (intro motion)
```

View the screenshot and grade it against `.claude/skills/awwwards-standard/SKILL.md`
before claiming a visual task complete. Commit every verified win.

## Build state (Aug 2026)

Rebuilding to the 8-phase photography-first spec. Phases 1–2 (foundation,
preloader) are verified and committed. Phases 3–8 (hero, editorial, room
chapters, details/enquiry, cursor, mobile) are **blocked on real photography
landing in `/public`** — the current assets there are AI-generated placeholders
and must not be built with (see `lib/property.ts` for listing data).

Palette tokens in `app/globals.css` are provisional (sampled via sharp);
re-sample from the real photos when they arrive.
