# Visual Audit Report: GSAP Card Filter Transition Snapping & Stuttering

This report details the root causes and actionable solutions for the snapping, stuttering, and layout collapse of project cards during filter transitions.

---

## 1. Observation

During the visual audit, the following specific implementations were identified:

### A. Filter Logic and GSAP Animation
In `js/main.js` (lines 169–204), the filter category transitions are handled by toggling `display` styles and executing `gsap.fromTo` on matched elements:
```javascript
169:   /* ---------- Project Category Filters ---------- */
170:   const filterBtns = document.querySelectorAll('.filter-btn');
171:   const projectCards = document.querySelectorAll('.project-card');
172: 
173:   if (filterBtns.length > 0 && projectCards.length > 0) {
174:     filterBtns.forEach(btn => {
175:       btn.addEventListener('click', (e) => {
176:         e.preventDefault();
177:         
178:         // Update active class on buttons
179:         filterBtns.forEach(b => {
180:           b.classList.remove('active');
181:         });
182:         
183:         btn.classList.add('active');
184:         
185:         const filterValue = btn.getAttribute('data-filter');
186:         
187:         projectCards.forEach(card => {
188:           const category = card.getAttribute('data-category');
189:           
190:           if (filterValue === 'all' || category === filterValue) {
191:             // Smooth show
192:             card.style.display = 'block';
193:             gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
194:           } else {
195:             // Hide
196:             card.style.display = 'none';
197:           }
198:         });
199: 
200:         // Refresh ScrollTrigger to recalculate positions
201:         ScrollTrigger.refresh();
202:       });
203:     });
204:   }
```

### B. Conflicting CSS Transitions
In `css/style.css` (line 1004), the `.project-card` class has CSS transitions defined for `all` over a slow duration:
```css
1004:   transition: all var(--dur-slow) var(--ease-out), background var(--theme-transition), border-color var(--theme-transition);
```
Additionally, in `css/style.css` (lines 1692–1700), themed transitions are defined on `.project-card` that transition the `transform` property:
```css
1692: .section, .timeline-card, .skill-category, .project-card, .stat-card,
1693: .cert-card, .contact-link, .footer, .about-text p, .about-text p strong,
1694: .timeline-company, .timeline-details li, .skill-category-title,
1695: .project-card-title, .project-card-desc, .contact-link-value, .cert-info h3,
1696: .cert-info p {
1697:   transition-property: background-color, color, border-color, box-shadow, transform;
1698:   transition-duration: var(--dur-normal);
1699:   transition-timing-function: var(--ease-out);
1700: }
```
Where transition durations are configured on lines 70–72:
```css
70:   --dur-fast: 0.2s;
71:   --dur-normal: 0.4s;
72:   --dur-slow: 0.6s;
```

### C. Layout Styles of Cards & Grid
In `css/style.css` (lines 991–996), the grid is a CSS Grid layout:
```css
991: .projects-grid {
992:   display: grid;
993:   grid-template-columns: repeat(2, 1fr);
994:   gap: var(--space-lg);
995:   margin-top: var(--space-xl);
996: }
```
The individual `.project-card` layout is configured as a flexbox container (lines 1006–1008):
```css
1006:   display: flex;
1007:   flex-direction: column;
```
For desktop viewports, featured cards span the full grid and display side-by-side using `flex-direction: row` (lines 1160–1174):
```css
1160: .project-card.featured {
1161:   grid-column: 1 / -1;
1162:   flex-direction: row;
1163: }
1164: 
1165: .project-card.featured .project-card-image {
1166:   width: 45%;
1167:   aspect-ratio: auto;
1168:   min-height: 100%;
1169: }
1170: 
1171: .project-card.featured .project-card-body {
1172:   width: 55%;
1173:   padding: var(--space-xl) var(--space-lg);
1174: }
```

### D. Missing Libraries
In `index.html` (lines 617–620), GSAP core and ScrollTrigger are loaded, but the GSAP `Flip` plugin is missing:
```html
617:   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
618:   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
619:   <script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>
```

---

## 2. Logic Chain

Based on the direct observations above, the transitions snap, stutter, and layout breaks due to these interconnected issues:

1. **CSS Transition Collision**:
   * **Reasoning**: GSAP updates inline CSS styles (`transform` and `opacity`) on every frame tick (`~16.7ms`) to create smooth animations.
   * **Link**: Because `.project-card` has `transition: all 0.6s` (Observation B) and a themed transition targeting `transform` over `0.4s` (Observation B), the browser intercepts every frame update made by GSAP and attempts to transition it.
   * **Result**: The two systems fight, resulting in low frame rate stuttering during the transition and a jarring snap when the animation concludes.

2. **Instant Grid Layout Shifts (Snapping)**:
   * **Reasoning**: In CSS Grid layouts (`.projects-grid`, Observation C), elements set to `display: none` are instantly removed from the layout flow.
   * **Link**: In `js/main.js` (lines 192 & 196, Observation A), card elements are instantly set to `display: none` or `display: block`.
   * **Result**: The remaining cards instantly jump (snap) to fill the empty space, without any visual interpolation or smooth translation.

3. **Featured Card Layout Collapse Bug**:
   * **Reasoning**: The stylesheet defines `.project-card` as a flex container (Observation C) and featured cards as `flex-direction: row` (Observation C) on desktop to render the image and text side-by-side.
   * **Link**: The filtering script in `js/main.js` sets `card.style.display = 'block'` (line 192, Observation A) to restore visibility.
   * **Result**: Overriding the display to `block` strips the flexbox context. The cards stack vertically, collapsing and breaking the side-by-side structure of the featured project cards.

4. **ScrollTrigger Refresh Thrashing**:
   * **Reasoning**: Calling `ScrollTrigger.refresh()` forces the browser to recalculate all DOM positions and dimensions (reflow).
   * **Link**: Calling it synchronously (line 201, Observation A) immediately after updating displays and launching animations causes layout thrashing precisely as animations begin.
   * **Result**: Visual stuttering and dropped frames at the start of the filter transition.

5. **Missing Tools**:
   * **Reasoning**: Grid layout transition animations are complex. Standard GSAP cannot translate layout shifts of siblings automatically.
   * **Link**: The `Flip` plugin (designed for this exact scenario) is not loaded or registered (Observation D).

---

## 3. Caveats

* **E2E Test Compatibility**: The E2E tests in `tests/test_suite.py` assert category filtering by checking if display is not `'none'` (for visible cards) and is `'none'` (for hidden cards). Restoring display using `card.style.display = ''` will make the browser evaluate the computed style to `flex` (which is `!== 'none'`). This is fully compatible and will not break the test suite.
* **Responsive Behavior**: Under 992px wide, featured cards stack vertically. When using GSAP Flip, it handles viewport changes and media query differences automatically as long as styles are updated on resize.
* **Theme Adaptations**: Conic gradient border animations are applied on hover. These rely on CSS custom properties (`--border-angle`). They do not conflict with the Flip transition since they run on hover interactions.

---

## 4. Conclusion

The stuttering, snapping, and layout breaking are caused by **CSS transition conflicts, incorrect display overrides (`block` instead of `''`), instantaneous grid shifts, and layout thrashing from synchronous ScrollTrigger refreshes**.

To eliminate these issues, we propose the following concrete modifications:

### A. Update `css/style.css`
1. Remove `transform`, `opacity`, and `all` from transitions on `.project-card`.
2. Keep transitions restricted to theme properties that GSAP does not animate (`background-color`, `border-color`, `box-shadow`).

**Proposed Code Snippets (Style edits)**:
* *Edit 1 (line 1004)*:
  ```css
  /* Before */
  transition: all var(--dur-slow) var(--ease-out), background var(--theme-transition), border-color var(--theme-transition);
  
  /* After */
  transition: border-color var(--theme-transition), background var(--theme-transition), box-shadow var(--dur-normal) var(--ease-out);
  ```

* *Edit 2 (line 1692–1700)*: Remove `.project-card` from the list of classes that transition the `transform` property:
  ```css
  /* Before */
  .section, .timeline-card, .skill-category, .project-card, .stat-card, ... {
    transition-property: background-color, color, border-color, box-shadow, transform;
    ...
  }
  
  /* After */
  /* Remove .project-card from the block, and define its themed transition separately without transform */
  .section, .timeline-card, .skill-category, .stat-card,
  .cert-card, .contact-link, .footer, .about-text p, .about-text p strong,
  .timeline-company, .timeline-details li, .skill-category-title,
  .project-card-title, .project-card-desc, .contact-link-value, .cert-info h3,
  .cert-info p {
    transition-property: background-color, color, border-color, box-shadow, transform;
    transition-duration: var(--dur-normal);
    transition-timing-function: var(--ease-out);
  }
  
  .project-card {
    transition-property: background-color, color, border-color, box-shadow;
    transition-duration: var(--dur-normal);
    transition-timing-function: var(--ease-out);
  }
  ```

### B. Include GSAP Flip Plugin in `index.html`
Add the Flip plugin script from the CDN:
```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <!-- Load Flip plugin -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js"></script>
  <script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>
```

### C. Register Flip in `js/animations.js`
Register the Flip plugin alongside ScrollTrigger (line 8):
```javascript
  gsap.registerPlugin(ScrollTrigger, Flip);
```

### D. Refactor Filter Logic in `js/main.js`
Rewrite the project filter section to use GSAP Flip, kill active tweens to prevent overlapping animations, restore layouts by resetting display inline styles to `''`, and defer `ScrollTrigger.refresh()` until the animation completes:
```javascript
  /* ---------- Project Category Filters ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active class on buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        // 1. Capture the current layout state (coordinates and sizes)
        const state = Flip.getState(projectCards);
        
        // 2. Perform layout modifications
        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          
          // Prevent overlapping tweens
          gsap.killTweensOf(card);
          
          if (filterValue === 'all' || category === filterValue) {
            // Restore default stylesheet display (display: flex) by clearing inline display style
            card.style.display = '';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });
        
        // 3. Animate layout changes smoothly
        Flip.from(state, {
          duration: 0.5,
          ease: 'power2.out',
          absolute: true, // Prevents elements from crashing or collapsing during reflow
          onComplete: () => {
            // Refresh ScrollTrigger only after the Flip animation finishes to prevent layout thrashing
            ScrollTrigger.refresh();
          }
        });
      });
    });
  }
```

---

## 5. Verification Method

To verify the proposed changes:

1. **Execute E2E Test Suite**:
   Run the project's integrated test runner:
   ```bash
   python tests/run_tests.py
   ```
   All tests must pass successfully (exit code 0).
2. **Visual Inspection**:
   * View the page in a desktop web browser.
   * Click on the "Production Solutions", "Full-Stack SaaS", and "Analytics & BI" filters.
   * Verify that the cards transition smoothly to their new positions in the grid layout, without snapping or stuttering.
   * Confirm that featured project cards (e.g., SAP Integration Testing Tracker) retain their side-by-side (row) layout on desktop, rather than collapsing into a vertical stack.
3. **Invalidation Conditions**:
   The fix is invalid if:
   * Project cards jump instantly to new locations when a filter is applied.
   * Card animations stutter during movement.
   * Featured project cards stack vertically on desktop width after filters are clicked.
