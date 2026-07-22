# Handoff Report: Mobile Responsive & Layout Polish Investigation

## Observation
During analysis of the styling files (`css/style.css`), page markup (`index.html`), and dynamic scripts (`js/github_stats.js`), the following key lines were observed:

1. **Card and Modal Paddings:**
   - In `css/style.css` line 837, the timeline cards have a padding of `var(--space-lg)`:
     ```css
     .timeline-card {
       ...
       padding: var(--space-lg);
       ...
     }
     ```
     Where `--space-lg` is defined as `2.5rem` (40px) at line 53.
   - In `css/style.css` line 924, skill categories have the same padding:
     ```css
     .skill-category {
       ...
       padding: var(--space-lg);
       ...
     }
     ```
   - In `css/style.css` line 1043, project card bodies have:
     ```css
     .project-card-body {
       padding: var(--space-lg);
       ...
     }
     ```
   - In `css/style.css` line 1167, featured project card bodies have:
     ```css
     .project-card.featured .project-card-body {
       ...
       padding: var(--space-xl) var(--space-lg);
     }
     ```
     Where `--space-xl` is `4rem` (64px) and `--space-lg` is `2.5rem` (40px).
   - In `css/style.css` line 1956, the modal container padding is defined as:
     ```css
     .modal-container {
       padding: 36px 40px;
       ...
     }
     ```
   - There are **no overrides** for `.timeline-card`, `.skill-category`, `.project-card-body`, or `.modal-container` under the `@media (max-width: 768px)` media query in `css/style.css`.

2. **GitHub Repositories Grid Layout:**
   - In `index.html` line 420, the grid container is defined as:
     ```html
     <div id="githubReposGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 48px;">
     ```
   - The repository cards appended to this grid by `js/github_stats.js` (line 151) have `padding: 20px;` and default block layout, with no specific width rules.

3. **Mobile Navbar Wrapper Center Alignment:**
   - In `css/style.css` line 217, the desktop layout is:
     ```css
     .nav-wrapper {
       position: fixed;
       top: 20px;
       left: 0;
       width: 100vw;
       display: flex;
       justify-content: center;
       z-index: 9999;
       ...
     }
     ```
   - In `css/style.css` line 1542, the mobile layout (under `@media (max-width: 768px)`) is:
     ```css
       .nav-wrapper {
         max-width: 95vw;
         margin: 0 auto;
       }
     ```

---

## Logic Chain

1. **Paddings (Cards and Modals):**
   - *Observation:* Default paddings of 40px (`var(--space-lg)`) are used for timeline, skill, and project cards, as well as the modal container. No media query resets this value.
   - *Inference:* On a 320px mobile viewport, a card taking 100% width has 80px total padding (40px left + 40px right). This leaves only 240px for readable content, which squeezes text content and looks poorly balanced.
   - *Conclusion:* We need to explicitly reset these padding values to `20px` under `@media (max-width: 768px)` to reclaim screen real estate on mobile devices.
   - *Featured Card Layout Adjustment:* In addition, the desktop featured project card (`.project-card.featured`) utilizes `flex-direction: row` with a `45%/55%` image/body split. Under 768px, this row layout will break and squeeze. We must stack it (`flex-direction: column`), make the components 100% wide, reset the image aspect ratio to `16/10`, and reduce its body padding to `20px` to match normal cards.

2. **GitHub Grid Overflow:**
   - *Observation:* `#githubReposGrid` is styled inline with `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`.
   - *Inference:* Under 768px, the section layout has 24px of padding on both sides (`--space-md` = 1.5rem = 24px padding at line 1540). On a 320px viewport, the available width inside the section is `320px - 48px = 272px`. Because `minmax(280px, 1fr)` specifies that a column can never shrink below 280px, the grid cell expands to 280px and overflows the section width by 8px, introducing horizontal scrollbars.
   - *Conclusion:* We must use `min(280px, 100%)` inside `minmax` so that if the available width falls below 280px, the column scales down to `100%` of the container width instead of overflowing.

3. **Mobile Navbar Off-Center Position:**
   - *Observation:* `.nav-wrapper` is a `position: fixed` element. On desktop, it has `left: 0; width: 100vw;`. On mobile, it has `max-width: 95vw; margin: 0 auto;`.
   - *Inference:* In CSS, `margin: auto` only centers a fixed-positioned element if both `left` and `right` anchor properties are explicitly declared. Since `right` is unset on desktop and inherited on mobile, the browser positions the wrapper at the left edge (`left: 0`), restricting its width to `95vw`. This results in a `5vw` empty gap on the right hand side, pushing the navbar off-center.
   - *Conclusion:* Adding `right: 0;` inside the `@media (max-width: 768px)` override resolves this, letting the browser compute equal horizontal auto-margins and perfectly center the navbar on mobile screens.

---

## Caveats
- No caveats. The issues were pinpointed to exact lines and the CSS properties required to resolve them.

---

## Conclusion
We recommend the following modifications to resolve mobile responsive layout issues down to 320px:

1. **Card/Modal Padding & Featured Layout Override:**
   Add the following rules to the `@media (max-width: 768px)` media query in `css/style.css`:
   ```css
   .timeline-card,
   .skill-category,
   .project-card-body,
   .project-modal .modal-container {
     padding: 20px;
   }

   .project-card.featured {
     flex-direction: column;
   }

   .project-card.featured .project-card-image {
     width: 100%;
     aspect-ratio: 16/10;
   }

   .project-card.featured .project-card-body {
     width: 100%;
     padding: 20px;
   }
   ```

2. **GitHub Grid Layout Fluidity:**
   In `index.html` line 420, change:
   ```html
   <div id="githubReposGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 48px;">
   ```
   to:
   ```html
   <div id="githubReposGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 24px; margin-bottom: 48px;">
   ```
   *(Alternatively, this can be moved to the stylesheet for cleaner separation of concerns, e.g. removing the inline style attribute from `index.html` and adding `#githubReposGrid { ... }` in `css/style.css`)*.

3. **Mobile Navbar Alignment:**
   In `css/style.css` line 1542 (under `@media (max-width: 768px)`), add `right: 0;` to the `.nav-wrapper` class:
   ```css
     .nav-wrapper {
       max-width: 95vw;
       margin: 0 auto;
       right: 0; /* Centers fixed-position wrapper */
     }
   ```

---

## Verification Method
To verify these fixes:
1. Open the project in a web browser.
2. Open Developer Tools (F12) and toggle device emulation to a mobile preset (e.g. iPhone SE, width 375px) or manually resize the width down to 320px.
3. Inspect `.timeline-card`, `.skill-category`, `.project-card-body`, and `.modal-container` to verify that their padding computes to `20px`.
4. Inspect `.project-card.featured` to confirm it stacks vertically and the body padding is `20px`.
5. Inspect `#githubReposGrid` and its children at 320px width to verify that no elements overflow horizontally.
6. Inspect `.nav-wrapper` to confirm that it is centered horizontally with equal margins on the left and right sides.
