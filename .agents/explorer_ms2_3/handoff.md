# Theme & Contrast Analysis Handoff Report

## 1. Observation
- **Theme switching mechanism**:
  - Found in `js/main.js` (lines 8–28):
    ```javascript
    const html = document.documentElement;
    const THEME_KEY = 'ukr-portfolio-theme';
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    html.setAttribute('data-theme', savedTheme);
    ...
    window.dispatchEvent(new Event('theme-change'));
    ```
- **Stock ticker canvas text drawing logic**:
  - Found in `js/animations.js` (lines 37–225) under `initParticles()`. The text nodes draw with hardcoded low opacity values (`0.05`):
    ```javascript
    this.opacity = 0.05;
    ...
    if (this.isPositive) {
      ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity})`; // Neon Green
    } else {
      ctx.fillStyle = `rgba(239, 68, 68, ${this.opacity})`; // CNBC Red
    }
    ```
- **Hardcoded backgrounds (`rgba(255,255,255,0.02)`)**:
  - Found inline in `index.html` (lines 370, 374, 378) inside the `github-metrics-card` section:
    ```html
    <div style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color);">
    ```
  - Found inline in `js/github_stats.js` (line 151) inside the `github-repo-card-inner` string builder:
    ```javascript
    <div class="github-repo-card-inner" style="padding:20px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); ...">
    ```
  - Found in `css/style.css` (line 2416) for repository card hovers:
    ```css
    background: rgba(255, 255, 255, 0.04) !important;
    ```
  - Found in other elements: `js/main.js` (line 302) for Case Study modal elements, and `index.html` (line 540) for the contact form.

## 2. Logic Chain
1. **Dynamic Theme Querying**: By reading the attribute `data-theme` on the document element `document.documentElement` (`html.getAttribute('data-theme')`), we can determine whether the light or dark theme is active at any time.
2. **Dynamic Contrast in Canvas**: At `0.05` opacity, the neon green and red text on a white background (`#f8f9fa` in light mode) does not meet contrast guidelines and is invisible. An opacity of `0.18` and darker red/green text colors in light mode (e.g., `green-700` / `rgba(21, 128, 61, ...)` and `red-700` / `rgba(185, 28, 28, ...)`) will achieve optimal visibility.
3. **Synchronizing Theme Changes on Canvas**: Since `js/main.js` already dispatches a custom window event (`theme-change`), registering an event listener in `initParticles()` allows the script to update the `opacity` of the existing `TextNode` objects in real-time, preventing visual resets/glitches.
4. **Theme-Aware Backgrounds**: The hardcoded `rgba(255,255,255,0.02)` background is barely visible against white backgrounds in light mode. Defining a CSS custom property `--bg-card-nested` (using `rgba(255, 255, 255, 0.02)` in dark mode and `rgba(0, 0, 0, 0.02)` in light mode) and using it to replace all hardcoded values creates a consistent, high-contrast, theme-aware layout.

## 3. Caveats
- Did not verify if there are any other canvas assets (e.g. cursor rings or glow animations) that require similar adjustments. However, looking at `css/style.css`, cursor ring border colors already reference `var(--cursor-color)` which changes depending on the theme.
- Assumed standard green/red levels are acceptable on light mode as long as they are darker, but further UX refinement on the exact color codes may be required.

## 4. Conclusion
The theme implementation is centralized on the `<html>` root attribute `data-theme`. The contrast issues in both the stock ticker canvas and the GitHub cards are due to hardcoded background colors and opacity properties that do not scale when switching to light mode. Using CSS Variables (`--bg-card-nested`) and registering a listener on `theme-change` to adjust the canvas text's color and opacity dynamically is a highly robust and non-disruptive solution.

## 5. Verification Method
1. **Ticker Contrast**: Load the site, toggle the theme to light mode, and verify that the canvas stock ticker text is legible (visible as green/red text nodes) and transitions seamlessly when toggling the theme.
2. **GitHub Card Backgrounds**: View the Profile Activity sub-metrics card elements (Public Repos, Total Stars, Followers) and pinned repo cards in both dark and light modes. Check that they have a visible border and sub-card background contrast (slightly darker overlay in light mode, slightly lighter in dark mode).
3. **Inspect Elements**: Confirm that elements do not contain hardcoded `rgba(255,255,255,0.02)` but instead leverage `var(--bg-card-nested)`.
