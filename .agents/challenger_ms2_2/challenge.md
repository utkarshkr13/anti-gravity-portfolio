# Challenge & Verification Report — Milestone 2 Theme and Contrast

## Challenge Summary

**Overall risk assessment**: **MEDIUM**

While the theme toggling mechanism and the canvas ticker opacities adapt correctly under rapid triggers and maintain high-fidelity styling states, there are critical UX and layout regressions on mobile viewports:
1. **Failed Aspect Ratio on Mobile**: Mobile featured project card images are heavily stretched due to incorrect min-height styles.
2. **Failed Scroll Lock**: Lenis scroll lock is not engaged when the project case study modal is opened, allowing background scrolling.
3. **Sub-optimal Tap Targets**: Crucial mobile buttons (Theme Toggle, Modal Close) measure below the 48px accessibility recommendation.

---

## Challenges

### [High] Stretched Featured Project Card Image Container on Mobile
- **Assumption challenged**: The featured project card adapts fluidly on small screens and preserves standard aspect ratios.
- **Attack scenario**: On viewport resize to mobile aspect ratios (375x812), the featured image container style uses `min-height: 100%` and `aspect-ratio: auto`, which stretches the image container vertically (Physical aspect ratio falls to ~0.43:1).
- **Blast radius**: Severe layout distortion on all mobile screens. The card looks extremely stretched, breaking the design system grid and alignment.
- **Mitigation**: Update CSS for `.project-card.featured .project-card-image` to override `min-height: auto` and apply `aspect-ratio: 16/10` or a proportional height style inside media queries.

### [Medium] Background Scroll Not Contained on Modal Open
- **Assumption challenged**: Opening the modal dynamically locks background scrolling.
- **Attack scenario**: When the modal is toggled open, Lenis scroll updates are still processed or `body` overflow is not locked, allowing users to scroll the background container.
- **Blast radius**: Bad UX on both desktop and mobile viewports where scroll context is lost.
- **Mitigation**: Guarantee `window.lenis.stop()` executes on modal display, and bind `overflow: hidden` to `body` in the open state.

### [Low] Tiny Interactive Tap Targets on Mobile
- **Assumption challenged**: Tap targets on mobile meet standard accessibility sizing.
- **Attack scenario**: The theme toggle button renders at 36x36px and the modal close button renders at 32x32px, which are below the minimum recommended tap target size of 48x48px.
- **Blast radius**: Accessibility failure (WCAG 2.1 AA/AAA) leading to user frustration on mobile touchscreen devices.
- **Mitigation**: Expand padding/dimensions of these buttons using CSS to at least 48px.

---

## Stress Test Results

- **Rapid Theme Switching Stress Test** → Click `#themeToggle` 50 times in under 1.1s → Exactly 50 `theme-change` events dispatched, layout remains stable and non-collapsed → **PASS**
- **Canvas Ticker Adaptation: Light Mode** → Intercept `fillStyle` setter on canvas context → Captured styles: `rgba(22, 101, 52, 0.35)` (Green), `rgba(185, 28, 28, 0.35)` (Red) → **PASS**
- **Canvas Ticker Adaptation: Dark Mode** → Intercept `fillStyle` setter on canvas context → Captured styles: `rgba(34, 197, 94, 0.15)` (Green), `rgba(239, 68, 68, 0.15)` (Red) → **PASS**
- **Filter Buttons Active Styles** → Click `.filter-btn[data-filter="production"]` → Color matches white (`rgb(255, 255, 255)`), background updates to steel blue, and exactly one button has active class → **PASS**
- **Mobile Featured Card Aspect Ratio Regression** → Check computed styles of image container at 375x812 → Stretched to 503x1143px (aspect ratio ~0.43) instead of 1.6 -> **FAIL**
- **Lenis Scroll Lock with Modal Open** → Toggle modal open → Body scroll lock did not engage, Lenis scroll is active -> **FAIL**

---

## Unchallenged Areas

- **System-level dark mode sync (prefers-color-scheme)** — Insufficient context, local storage is hardcoded to default to dark and theme switcher is manually toggled.
- **Print stylesheet styling** — Out of scope, focused entirely on screen rendering, theme switches, and dynamic script interactions.
