# Milestone 2 Synthesis of Explorer Findings

## Consensus Findings
1. **Theme Switching**: Handled via `data-theme` attribute on the `<html>` node, toggled by a click listener in `js/main.js` on `#themeToggle`, stored in `localStorage` under `ukr-portfolio-theme`, and broadcasted using the custom window event `'theme-change'`.
2. **Stock Ticker Contrast**:
   - The stock ticker canvas particle system is defined in `js/animations.js` within `initParticles()`.
   - The `TextNode` class instances draw text with a hardcoded `this.opacity = 0.05` and neon/CNBC colors which are completely illegible in light mode.
   - **Resolution**: Subscribe to the global `'theme-change'` event in `initParticles()`, track `currentTheme` dynamically, and update `texts` array elements' opacity. Refactor `TextNode.draw()` to use a higher opacity (`0.18` or `0.15`) and darker contrast colors (e.g. dark forest green and dark red) when the theme is light.
3. **Hardcoded Backgrounds and Borders**:
   - Backgrounds of `rgba(255,255,255,0.02)` are hardcoded in `index.html` (lines 370, 374, 378, 540), `js/github_stats.js` (line 151), and `js/main.js` (line 302).
   - Hover background of `rgba(255, 255, 255, 0.04) !important` is hardcoded in `css/style.css` (line 2416).
   - **Resolution**:
     - Define `--bg-subtle`, `--bg-subtle-hover` variables in `css/style.css` representing light transparent black/white overlays depending on active theme.
     - Move duplicate subcard styling into a CSS helper class `.github-metrics-subcard`.
     - Replace hardcoded background overlays with variables.
4. **Button Border Contrast**:
   - Secondary button border colors are hardcoded inline as `border-color: rgba(255,255,255,0.15)` in `index.html` (lines 80, 250, 278, 298, 317, 612).
   - **Resolution**: Define `--btn-secondary-border` variable in CSS and replace the hardcoded values.

## Implementation Details for Worker
The worker must apply changes to:
1. `css/style.css`
2. `js/animations.js`
3. `index.html`
4. `js/github_stats.js`
5. `js/main.js`
