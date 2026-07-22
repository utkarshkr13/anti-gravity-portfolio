## 2026-06-19T21:33:02Z
You are teamwork_preview_worker. Your working directory is d:\Utkarsh\Python\Side_Quest\Portfolio\.agents\worker_ms3.
Your task is to implement the fixes for Milestone 3 (Asset & Modal/Interactive Fixes).

### Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Fix Specifications

1. **Lenis Scroll Bypass & Jitter Fixes**:
   - In `js/main.js`, locate the Lenis smooth scroll setup:
     - Remove the custom requestAnimationFrame `raf` loop (lines 41–44) to prevent double update calls to Lenis. Keep only the GSAP ticker update loop:
       ```javascript
       lenis.on('scroll', ScrollTrigger.update);
       gsap.ticker.add((time) => lenis.raf(time * 1000));
       gsap.ticker.lagSmoothing(0);
       ```
     - Remove the global event listeners on `document` for `mouseover`, `touchstart`, and `touchend` that intercept `[data-lenis-prevent]` (lines 52–96). Lenis handles `data-lenis-prevent` elements natively.
     - In the modal open routine (`showModal` or around line 328 in `js/main.js`), toggle the body class:
       `document.body.classList.add('modal-open');`
     - In the modal close routine (`closeModal` or around line 341 in `js/main.js`), toggle the body class:
       `document.body.classList.remove('modal-open');`
   - In `css/style.css`, add the `.modal-open` class to the body style block:
     ```css
     body.modal-open {
       overflow: hidden;
       height: 100vh;
     }
     ```
   - In `css/style.css`, add `overscroll-behavior: contain;` to `.modal-container` to prevent native scroll chaining.

2. **GSAP Card Filter Transition Snapping**:
   - In `index.html`, add the GSAP Flip plugin CDN script before the main script loads (near line 617):
     ```html
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js"></script>
     ```
   - In `js/animations.js`, register the Flip plugin (line 8):
     ```javascript
     gsap.registerPlugin(ScrollTrigger, Flip);
     ```
   - In `css/style.css`, remove conflicting transitions from `.project-card`:
     - Modify `transition: all var(--dur-slow) ...` to transition only specific non-GSAP animated properties (like border-color, background, box-shadow).
     - Remove `.project-card` from the list of classes that transition `transform` on page theme toggle, or specify its transitions separately without transitioning `transform`.
   - In `js/main.js`, refactor the project category filters logic:
     - Use `Flip.getState(projectCards)` before modifying card visibility.
     - Kill active tweens on cards using `gsap.killTweensOf(card)` to prevent layout stutter.
     - To show cards, clear the display style: `card.style.display = '';` (do NOT use `'block'`, which breaks featured card flexbox layouts).
     - To hide cards, set `card.style.display = 'none';`.
     - Run `Flip.from(state, { duration: 0.5, ease: 'power2.out', absolute: true, onComplete: () => ScrollTrigger.refresh() })` to animate the layout shifts cleanly.

3. **Modal Close Button Header Overlap**:
   - In `css/style.css`:
     - Add a solid background matching the theme to `.modal-close-btn` (e.g., `background: var(--bg-card);`) and add `backdrop-filter: blur(10px);`.
     - Increase padding on `.modal-container` to `48px 56px 36px 40px` (or similar) to prevent the close button from overlapping content when at the top of scroll.
   - In `js/main.js`, hide the page navigation wrapper when the modal opens, and show it again when it closes:
     - When modal opens: `document.querySelector('.nav-wrapper').style.display = 'none';`
     - When modal closes: `document.querySelector('.nav-wrapper').style.display = '';`

### Verification
- Run the test suite: `python tests/run_tests.py`
- Document the build and test command and the execution output in your handoff report.
- Save your handoff report as handoff.md in your working directory and notify the parent orchestrator (conversation ID: 7f435bee-402d-49cb-83e4-48cd1ae718f5).
