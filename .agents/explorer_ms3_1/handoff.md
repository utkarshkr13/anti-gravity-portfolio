# Lenis Scroll Bypass and Scroll Issues Analysis Report

## 1. Observation
We observed the following definitions and behaviors in the codebase:

### A. Lenis Update Loop (Double update call)
In `js/main.js` (lines 41–50), the Lenis scroll is updated via two concurrent loops:
```javascript
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
```
Both the custom `raf` loop (line 41) and the GSAP ticker (line 49) invoke `lenis.raf()` independently, causing Lenis to calculate and apply scroll offsets twice per frame.

### B. Custom Scroll Prevention Event Listeners overriding `lenis.stop()`
In `js/main.js` (lines 52–96), custom event listeners are registered on the global `document` element to handle elements matching `[data-lenis-prevent]`:
```javascript
  let isLenisStopped = false;

  document.addEventListener('mouseover', (e) => {
    if (e.target && typeof e.target.closest === 'function') {
      const container = e.target.closest('[data-lenis-prevent]');
      if (container) {
        if (!isLenisStopped) {
          lenis.stop();
          isLenisStopped = true;
        }
      } else {
        if (isLenisStopped) {
          lenis.start();
          isLenisStopped = false;
        }
      }
    }
  }, { passive: true });
...
  document.addEventListener('touchend', (e) => {
    if (isLenisStopped) {
      lenis.start();
      isLenisStopped = false;
    }
  }, { passive: true });
```
When the project case study modal opens (lines 328–332), `window.lenis.stop()` is called. However:
1. `window.lenis.stop()` is invoked but the IIFE's local variable `isLenisStopped` is *not* updated to `true`.
2. When the user hovers over the modal body (which has `data-lenis-prevent` on `<div class="modal-container" data-lenis-prevent>`), the `mouseover` handler sets `isLenisStopped` to `true`.
3. When the user moves the cursor away from `modal-container` to hover over the close button (`modalCloseBtn`) or the backdrop (`modalOverlay`), which do not have `data-lenis-prevent`, the `else` block runs. Since `isLenisStopped` is `true`, it calls `lenis.start()` and sets `isLenisStopped = false`. This reactivates the background body scroll while the modal is still open.
4. On mobile devices, when the user touches and scrolls the modal, `touchstart` sets `isLenisStopped` to `true`. Once the user lifts their finger, a global `touchend` event fires (lines 90–95). This triggers the `touchend` listener, calling `lenis.start()` and resetting `isLenisStopped` to `false`, immediately resuming body scroll.

### C. Missing CSS Body Overflow Locks
In `css/style.css` (lines 135–144), the body style is defined as follows:
```css
body {
  font-family: var(--font-body);
  font-size: var(--fs-base);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  line-height: 1.7;
  overflow-x: hidden;
  cursor: none;
  transition: background-color var(--theme-transition), color var(--theme-transition);
}
```
No CSS rule exists to toggle `overflow: hidden` on the body when a modal is open.

### D. Missing CSS Scroll Chaining Containment
In `css/style.css` (lines 1987–1991), the modal scrollable container is styled as:
```css
.modal-container {
  padding: 36px 40px;
  overflow-y: auto;
  flex: 1;
}
```
There is no `overscroll-behavior: contain` styling, which means native scroll chaining will bubble to the parent viewport when a scroll boundary is reached.

---

## 2. Logic Chain
1. **Lenis Scroll Jitter**:
   - Updates are queued via `requestAnimationFrame(raf)` calling `lenis.raf(time)` AND `gsap.ticker.add(...)` calling `lenis.raf(time * 1000)`.
   - Double tick invocation conflicts inside the Lenis engine, triggering redundant calculations and causing scroll stutter or jumpiness.
2. **Scroll Lock Bypass**:
   - The modal opening routine calls `window.lenis.stop()` to disable background scroll.
   - However, the global `mouseover`/`touchstart` and `touchend` event delegation checks if elements have `data-lenis-prevent`.
   - Because the close button (`modalCloseBtn`) and the background overlay (`modalOverlay`) do not have `data-lenis-prevent`, moving the cursor to them (or ending a touch scroll gesture anywhere on the screen) invokes `lenis.start()`.
   - This overrides the modal's `stop()` state, reactivating background scrolling while the modal remains open.
3. **Chaining & Native Scroll Bypass**:
   - Since the body viewport is not explicitly restricted via `overflow: hidden` when the modal is open, browser-level inertial scrolling (especially on macOS/iOS Safari) can still push the page view around.
   - The lack of `overscroll-behavior: contain` on `.modal-container` allows any scroll events reaching the top or bottom of the case study content to bleed directly into the background document.

---

## 3. Caveats
- The behavior of Lenis might vary slightly depending on the exact version (`unpkg.com/lenis@1.1.14` is used), but standard API lifecycle expectations remain consistent.
- No other potential scroll blockers or intercepting libraries were found.

---

## 4. Conclusion
The body scroll bypass and jitter are caused by:
1. Redundant double updates to the Lenis engine in the animation loops.
2. An overly aggressive, global event listener delegation that starts/stops Lenis based on cursor hover and touch events, which resets the modal's scroll block.
3. Absence of a native CSS overflow lock class (`.modal-open` with `overflow: hidden`) on the body when the modal is visible.
4. Absence of `overscroll-behavior: contain` on the modal scroll container.

### Actionable Recommendations (See proposed_changes.patch)
1. **Remove the custom `raf` loop** in `js/main.js` and rely solely on the GSAP ticker.
2. **Remove the global mouseover, touchstart, and touchend delegation listeners** in `js/main.js`. Lenis natively supports `data-lenis-prevent`.
3. **Toggle a `.modal-open` class** on the `body` element when opening and closing the case study modal, and define `.modal-open { overflow: hidden; height: 100vh; }` in `css/style.css`.
4. **Add `overscroll-behavior: contain`** to `.modal-container` in `css/style.css` to prevent scroll chaining.

---

## 5. Verification Method
1. **To Verify Scroll Jitter Fix**:
   - Inspect the network requests and verify `js/main.js` has only one update loop for Lenis (GSAP Ticker integration).
   - Use the browser performance profiling tool during scroll to verify there is no duplicated `lenis.raf()` call within the same animation frame.
2. **To Verify Scroll Lock / Bypass Fix**:
   - Open the portfolio website.
   - Open a project case study modal.
   - Try scrolling using the scroll wheel or touch drag on:
     - The modal content itself.
     - The close button.
     - The modal backdrop/overlay.
   - The background page should remain completely stationary.
   - Inspect the HTML structure: verify that the `<body>` tag receives the class `modal-open` when the modal is displayed, and that the class is removed when the modal is closed.
   - Verify that `.modal-container` possesses `overscroll-behavior: contain` in the styles pane of the developer tools.
