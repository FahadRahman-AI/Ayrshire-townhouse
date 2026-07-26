# property-tour

A light editorial luxury real-estate site (awwwards "Art of Living" direction):
warm ivory canvas, colossal Fraunces serif, big architectural photography,
generous whitespace. Next.js 14 (App Router) + Lenis smooth scroll + GSAP reveals,
Fraunces (display) / Inter (body).

## MANDATORY before ANY visual work — load these two, always

1. **`awwwards-standard`** skill (`.claude/skills/awwwards-standard/SKILL.md`) —
   the verification mechanism + Awwwards quality checklist. **Never claim a visual
   task done without running `node screenshot.js`, viewing the screenshot, and
   grading it against the checklist honestly.** Also enforces finish-before-expand,
   checkpoint-commit every verified win, and naming the honest ceiling.
2. **`operating-doctrine`** — the user's Level-4 quality bar.

These two govern every design/UI/layout/styling/typography/motion change. Also see
`ENGINEERING_DISCIPLINE.md` at repo root (same rules, plain form). The house-style
reference skill `immersive-3d-doctrine` remains available for cinematic/3D work.

## Verify visually — the mechanism, not optional

`node screenshot.js` launches a dev server, captures the page via Playwright, and
saves the screenshot. **View it yourself and grade it before saying "done."**
Note: session-launched dev servers get reaped here — prefer `screenshot.js`
(self-contained) or have the user run `npm run dev` in their own terminal.
