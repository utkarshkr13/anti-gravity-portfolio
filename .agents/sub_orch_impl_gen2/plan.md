# Plan - Milestone 3: Asset & Modal/Interactive Fixes

## Current Phase: 2B (Iteration Loop)
Synthesized Explorer findings.

## Step 1: Initialize Files
- [x] Create BRIEFING.md
- [x] Create plan.md
- [x] Create context.md
- [x] Start heartbeat cron (every 10 minutes)

## Step 2: Spawn Explorers
- [x] Spawn 3 Explorers to investigate Milestone 3 issues.
- [x] Wait for Explorers to complete and read their handoffs.

## Step 3: Synthesis & Strategy Selection
- [x] Synthesize findings from the 3 Explorers:
  - **Lenis scroll bypass**: Remove double RAF tick in `js/main.js`, remove custom mouse/touch listeners overriding scroll stop, add `body.modal-open` style (`overflow: hidden; height: 100vh;`) and toggle it on modal open/close, add `overscroll-behavior: contain` on `.modal-container`.
  - **GSAP card filter snapping**: Remove conflicting CSS transitions on `.project-card`, load GSAP Flip plugin in `index.html` and register in `js/animations.js`, refactor filter category logic in `js/main.js` to use GSAP Flip, restore display with `''` (empty string) instead of `'block'` to preserve featured card layout, defer `ScrollTrigger.refresh()` to `onComplete`.
  - **Modal close button overlap**: Set a solid background on `.modal-close-btn` matching the theme, adjust padding on `.modal-container` to prevent overlap at scroll top, hide page navigation `.nav-wrapper` when modal is open to reduce visual clutter.

## Step 4: Dispatch Worker
- [ ] Spawn Worker with implementation instructions.
- [ ] Ensure worker verifies with build and tests.

## Step 5: Review & Verification
- [ ] Spawn 2 Reviewers to verify correctness, completeness, and layout.
- [ ] Spawn 2 Challengers to verify interactive behaviour.
- [ ] Spawn Forensic Auditor to check integrity.

## Step 6: Gate Evaluation & Milestone Completion
- [ ] Verify all criteria pass.
- [ ] Mark Milestone 3 as DONE in progress.md and SCOPE.md.
