# Worker MS2 - Plan and Changes

## Summary of Changes
Successfully implemented theme-toggling capability and contrast fixes across the codebase. Replaced hardcoded translucent light backgrounds (`rgba(255, 255, 255, 0.02)`) and static button border values (`rgba(255, 255, 255, 0.15)`) with context-aware CSS Custom Properties. Fixed the readability of ticker text (positive/negative ticker symbols) on the canvas element in light mode by dynamically modifying opacity and drawing colors.

## Detailed Log of Modifications

### 1. Style Customizations (`css/style.css`)
- Defined three new theme-aware CSS custom properties inside `[data-theme="dark"]`:
  - `--bg-subtle: rgba(255, 255, 255, 0.02);`
  - `--bg-subtle-hover: rgba(255, 255, 255, 0.04);`
  - `--btn-secondary-border: rgba(255, 255, 255, 0.15);`
- Defined the light-theme counterparts inside `[data-theme="light"]`:
  - `--bg-subtle: rgba(0, 0, 0, 0.02);`
  - `--bg-subtle-hover: rgba(0, 0, 0, 0.04);`
  - `--btn-secondary-border: rgba(0, 0, 0, 0.15);`
- Added the `.github-metrics-subcard` helper class containing:
  - `padding: 16px;`
  - `background: var(--bg-subtle);`
  - `border-radius: 8px;`
  - `border: 1px solid var(--border-color);`
  - `transition: background-color var(--theme-transition), border-color var(--theme-transition);`
- Changed the background on `.github-repo-card:hover .github-repo-card-inner` from `rgba(255, 255, 255, 0.04) !important` to `var(--bg-subtle-hover) !important`.

### 2. Markup Refactoring (`index.html`)
- Replaced the inline-styled divs of the three profile sub-metrics cards (repos, stars, followers) with `class="github-metrics-subcard"`, while preserving the `style="grid-column: span 2;"` layout override on the followers card.
- Replaced the hardcoded inline `background: rgba(255,255,255,0.02);` inside the `#contact` form with `background: var(--bg-subtle);`.
- Updated all secondary buttons (resume download, view case study, and modal repository links) containing inline styles to use `border-color: var(--btn-secondary-border);` instead of the hardcoded `rgba(255,255,255,0.15)`.

### 3. Ticker Canvas & Contrast Scripting (`js/animations.js`)
- In `initParticles()`, added theme tracking with a local variable `let currentTheme` dynamically populated from the `data-theme` attribute on the root element.
- Registered a listener on the custom `'theme-change'` event to re-evaluate `currentTheme`, set appropriate target opacity (`0.18` for light mode, `0.05` for dark mode), and instantly update the opacities of all active `TextNode` instances in the `texts` array.
- Initialized `TextNode.opacity` based on `currentTheme`.
- In `TextNode.draw()`, dynamically changed context fill styles:
  - **Light mode**: Forest Green (`rgba(22, 101, 52, opacity)`) for positive ticker nodes, Dark Red (`rgba(185, 28, 28, opacity)`) for negative ticker nodes.
  - **Dark/Default mode**: Neon Green (`rgba(34, 197, 94, opacity)`) for positive nodes, CNBC Red (`rgba(239, 68, 68, opacity)`) for negative nodes.

### 4. GitHub Stats and Modal Integration (`js/github_stats.js` & `js/main.js`)
- In `js/github_stats.js`:
  - Replaced the spotlight card's star count badge background value of `rgba(255,255,255,0.04)` with `var(--bg-subtle-hover)`.
  - Replaced repository card inner background styles with `var(--bg-subtle)`.
- In `js/main.js`:
  - Adjusted dynamically created KPI/impact item backgrounds inside `initModals` from `rgba(255,255,255,0.02)` to `var(--bg-subtle)`.
