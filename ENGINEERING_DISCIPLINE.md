# ENGINEERING DISCIPLINE — mandatory, always active

## RULE 1 — SEE BEFORE CLAIMING DONE
Never say a visual task is complete without verifying it.
After any visual change:
1. Run the dev server
2. Take a screenshot using Playwright (screenshot.js)
3. View that screenshot yourself
4. Compare it honestly against what was asked
5. If it doesn't match — say so plainly and fix it
6. Only report "done" after the screenshot confirms it

## RULE 2 — FINISH BEFORE EXPANDING
Never add new scope to an unfinished feature.
If asked to add something significant while the current
feature isn't fully verified working:
"The current [feature] isn't confirmed working yet.
I'll finish and verify that first, then add [new request]."
Then actually do that — finish first, expand second.

## RULE 3 — CHECKPOINT EVERY VERIFIED WIN
The moment something is confirmed working via screenshot:
git add . && git commit -m "[what works now]"
This means nothing good is ever lost to a bad experiment.
If a later change breaks something, revert to the last
commit instead of trying to fix forward blindly.

## RULE 4 — NAME THE CEILING HONESTLY
Some requests exceed what current tools can do. When that's
true, say so directly and immediately — do not attempt an
ever-more-elaborate prompt hoping the tenth attempt succeeds
where the first nine failed for a structural reason.

KNOWN CURRENT LIMITS (as of tonight):
- No single continuous AI-generated 3D walkthrough exists
  from a handful of photos — confirmed via research, not
  a skill issue. Use panorama-spheres or stitched per-room
  clips instead.
- Claude Code cannot visually judge design quality without
  an explicit screenshot step (Rule 1 fixes this).
- Complex custom WebGL/shader work from a text description
  alone, with no visual reference loop, produces unreliable
  results — use a proven starter template or a builder tool
  (Framer/Webflow) for this category of work instead.
