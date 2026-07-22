# BRIEFING — 2026-06-19T21:32:00Z

## Mission
Analyze codebase and identify why the GSAP card filter transitions snap or stutter when filters are clicked or applied.

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Read-only investigator
- Working directory: d:\Utkarsh\Python\Side_Quest\Portfolio\.agents\explorer_ms3_2
- Original parent: 7f435bee-402d-49cb-83e4-48cd1ae718f5
- Milestone: explorer_ms3_2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- CODE_ONLY network mode: no external web access, no curl/wget/lynx to external URLs.

## Current Parent
- Conversation ID: 7f435bee-402d-49cb-83e4-48cd1ae718f5
- Updated: 2026-06-19T21:32:00Z

## Investigation State
- **Explored paths**:
  - `js/main.js` (lines 169-204) — Project category filtering and GSAP animation logic.
  - `js/animations.js` — General GSAP initialization and canvas ticker.
  - `css/style.css` (lines 1004, 1692-1700) — Transitions and responsive layouts.
  - `index.html` (lines 617-620) — Script imports.
  - `tests/test_suite.py` and `tests/run_tests.py` — Test runner execution and validation criteria.
- **Key findings**:
  1. CSS Transition Conflict: `.project-card` has `transition: all 0.6s` and a themed transition on `transform`/`opacity` that directly conflict with GSAP's frame-by-frame inline style updates, causing lag and stuttering.
  2. Instant Layout Shifting: The script toggles display states instantly between `block` and `none`, causing other cards in the CSS Grid to snap to new coordinates with no layout animation.
  3. Flex Layout Collapse Bug: matched cards are restored using `card.style.display = 'block'`. Since the stylesheet styles `.project-card` as `display: flex` (and handles row-oriented side-by-side display for `.featured` cards), setting it to `block` breaks the card structures and collapses featured cards on desktop.
  4. ScrollTrigger Refresh Thrashing: calling `ScrollTrigger.refresh()` synchronously at the start of transitions triggers expensive layout reflows, causing stutter.
  5. Missing FLIP Plugin: The GSAP Flip plugin is not loaded, registered, or utilized.
- **Unexplored areas**: None. The frontend animation and layout codebase has been fully examined.

## Key Decisions Made
- Use GSAP Flip plugin as the recommended solution to achieve smooth grid reflows.
- Recommended removing `all` and `transform` from `.project-card` transitions in CSS to resolve conflicts.
- Recommended using `card.style.display = ''` to preserve flexbox layouts.

## Artifact Index
- d:\Utkarsh\Python\Side_Quest\Portfolio\.agents\explorer_ms3_2\ORIGINAL_REQUEST.md — Original request description
- d:\Utkarsh\Python\Side_Quest\Portfolio\.agents\explorer_ms3_2\progress.md — Progress tracking heartbeat
