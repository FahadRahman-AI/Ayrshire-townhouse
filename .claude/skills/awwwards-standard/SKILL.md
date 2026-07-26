---
name: awwwards-standard
description: >-
  ALWAYS load before and during ANY visual work in this project — pages,
  components, layout, styling, typography, motion, or design changes of any kind.
  The mandatory verification mechanism + Awwwards quality checklist every visual
  change is graded against. Enforces: screenshot-and-view before claiming done,
  finish-before-expand, checkpoint-commit every verified win, and naming the
  honest ceiling. Pairs with operating-doctrine (the Level-4 bar) and
  immersive-3d-doctrine (the house style). Trigger words: design, UI, layout,
  style, CSS, typography, hero, section, component, screenshot, "does it look",
  "make it better", done, verify.
---

# THE STANDARD — read fully before any visual work

## THE MECHANISM (this is what actually makes output good)
Never claim a visual task is done without seeing it.
1. Build the change
2. Run: node screenshot.js (launches dev server, captures
   full-page screenshot via Playwright to screenshots/latest.png)
3. View that screenshot yourself
4. Grade it against the checklist below, out loud, honestly
5. If it fails any line — fix it and screenshot again
6. Only report "done" once the screenshot passes every line

If screenshot.js doesn't exist yet, create it first, before
any other work:
npm install -D playwright && npx playwright install chromium

## THE AWWWARDS CHECKLIST — grade every screenshot against this
□ Typography: one confident display font, used at real scale —
  not a safe, small, default size
□ Whitespace: generous, deliberate — if it feels cramped, it fails
□ Colour: one or two colours maximum doing real work, not five
  competing for attention
□ Motion: something is moving with purpose, nothing loops
  aimlessly with no reason
□ Hierarchy: the eye knows exactly where to look first, second, third
□ Restraint: nothing decorative exists that doesn't earn its place
□ Would this stop someone mid-scroll on Awwwards' homepage?
  Answer honestly — yes or no, not "sort of"

## THE HONEST CEILING
Some things are structurally out of reach for hand-coded Claude
Code output tonight, regardless of instruction quality:
- Full continuous AI-generated 3D walkthroughs from a handful
  of photos — doesn't exist yet, confirmed by research
- Advanced custom WebGL/shader work with zero visual reference
  loop — unreliable without a proven starter base
When a request hits this ceiling, say so plainly and immediately.
Suggest the real alternative (a proven template, Cursor with
screenshot iteration, or a builder tool like Framer) rather than
attempting an increasingly elaborate prompt hoping it eventually works.

## FINISH BEFORE EXPANDING
Never add new scope to something not yet verified via screenshot.
If new scope is requested mid-build: finish and verify the current
piece first, say so plainly, then move to the new request.

## CHECKPOINT EVERY VERIFIED WIN
The moment a screenshot passes the checklist:
git add . && git commit -m "[what now verifiably works]"
If a later change breaks something, revert to that commit rather
than trying to fix forward blindly.
