# Milestone 2 Theme Toggling & Contrast Investigation

## Executive Summary
This report presents a read-only investigation of the theme toggling mechanism and contrast issues within the Portfolio codebase. We identified how theme switching is implemented, analyzed the stock ticker canvas contrast issues, and inspected hardcoded `rgba(255,255,255,0.02)` background elements. We propose concrete, theme-aware strategies using CSS Custom Properties and event listeners to ensure high legibility and aesthetic consistency in both dark and light modes.

---

## 1. Theme Switching Implementation

The website's theme-switching logic is implemented in **`js/main.js`** (lines 8–28) using a custom data attribute on the document element, local storage persistence, and a custom window event broadcast.

### Key Components:
1. **Target Element**: The theme is set as an attribute (`data-theme`) on the document element (`document.documentElement`), i.e., the `<html>` tag.
2. **State Persistence**: The active theme is stored in `localStorage` under the key `'ukr-portfolio-theme'`.
3. **Default Behavior**: If no saved theme is found, the system defaults to `'dark'`.
4. **Trigger Mechanism**: An event listener is attached to the `#themeToggle` button. On click, it:
   - Reads the current value of the `data-theme` attribute.
   - Toggles it between `'dark'` and `'light'`.
   - Sets the new value on the document root.
   - Writes the new value back to `localStorage`.
   - Dispatches a custom event `window.dispatchEvent(new Event('theme-change'))` to notify other components (such as canvas animations) that the theme has changed.

### Code Segment Reference (`js/main.js:8-28`):
```javascript
  /* ---------- Theme Toggle ---------- */
  const html = document.documentElement;
  const THEME_KEY = 'ukr-portfolio-theme';

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  html.setAttribute('data-theme', savedTheme);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      
      // Broadcast theme change for Canvas drawing
      window.dispatchEvent(new Event('theme-change'));
    });
  }
```

---

## 2. Stock Ticker Canvas Text Drawing Logic & Contrast Strategy

The stock ticker is rendered inside the canvas with ID `heroGlobe`. Its logic is implemented in **`js/animations.js`** under the `initParticles` function (lines 37–225).

### The Contrast Issue:
The canvas text nodes use hardcoded neon green and red colors at a very low opacity (`0.05`):
- Green: `rgba(34, 197, 94, 0.05)`
- Red: `rgba(239, 68, 68, 0.05)`

While these colors are legible and serve as a subtle background effect against the dark background (`#08090c`), they become **virtually invisible** on a light background (`#f8f9fa`) due to extremely low contrast.

### Contrast Refactoring Strategy:
1. **Dynamic Theme Detection**: Determine the active theme in the `TextNode` constructor and adapt initial opacity.
2. **Adjusted Colors & Opacities**:
   - **Dark Mode**: Keep opacity at `0.05` and use vibrant neon colors.
   - **Light Mode**: Increase opacity to `0.18` (or `0.20`) and use slightly darker, more saturated green and red shades (e.g., `green-700` and `red-700`) to guarantee contrast and legibility without being visually overwhelming.
3. **Theme Change Listener**: Register a `theme-change` event listener on `window` inside `initParticles()` to update the `opacity` property of existing text nodes on the fly, avoiding jarring resets or jumps in ticker positions.

### Proposed Code Changes:

#### Update `TextNode` Constructor and `draw` method in `js/animations.js`:
```javascript
    class TextNode {
      constructor(stockData, colX, rowY, rowSpeed) {
        const sign = stockData.change_pct >= 0 ? '+' : '';
        const arrow = stockData.change_pct >= 0 ? '▲' : '▼';
        this.text = `${stockData.symbol}  ${stockData.currency || '$'}${stockData.price}  ${arrow} ${sign}${stockData.change_pct}%`;
        this.isPositive = stockData.change_pct >= 0;
        
        ctx.font = `13px 'Courier New', Courier, monospace`;
        this.textWidth = ctx.measureText(this.text).width;
        
        this.baseX = colX;
        this.baseY = rowY;
        this.x = this.baseX;
        this.y = this.baseY;
        this.vx = 0;
        this.vy = 0;
        
        // Dynamically adjust initial opacity based on active theme
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        this.opacity = theme === 'light' ? 0.18 : 0.05; 
        
        this.scrollSpeed = rowSpeed || 0.8;
      }
      
      // ... update() remains the same ...

      draw() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (theme === 'light') {
          // Use darker/more saturated green and red on light background
          if (this.isPositive) {
            ctx.fillStyle = `rgba(21, 128, 61, ${this.opacity})`; // Darker green (green-700)
          } else {
            ctx.fillStyle = `rgba(185, 28, 28, ${this.opacity})`; // Darker red (red-700)
          }
        } else {
          // Use neon green and CNBC red on dark background
          if (this.isPositive) {
            ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity})`; // Neon Green
          } else {
            ctx.fillStyle = `rgba(239, 68, 68, ${this.opacity})`; // CNBC Red
          }
        }
        ctx.fillText(this.text, this.x, this.y);
      }
    }
```

#### Register `theme-change` Listener inside `initParticles()` in `js/animations.js`:
```javascript
    // Update existing particle opacity when theme changes dynamically
    window.addEventListener('theme-change', () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const targetOpacity = theme === 'light' ? 0.18 : 0.05;
      texts.forEach(t => t.opacity = targetOpacity);
    });
```

---

## 3. GitHub Sub-Metrics Cards Background & Borders Strategy

### Hardcoded Locations Identified:
1. **`index.html`** (lines 370, 374, 378):
   Three sub-metric divs (Public Repos, Total Stars, Followers) have inline styles using `background: rgba(255,255,255,0.02);`.
2. **`js/github_stats.js`** (line 151):
   Repository cards rendered dynamically in `updateGitHubUI()` have an inline style of `background: rgba(255,255,255,0.02);`.
3. **`css/style.css`** (line 2416):
   The hover state for the repository card inner content is hardcoded to `background: rgba(255, 255, 255, 0.04) !important;`.

### The Contrast Issue:
In dark theme, overlaying `rgba(255,255,255,0.02)` on a `#13161c` background creates a subtle, appealing nesting effect. In light theme, overlaying `rgba(255,255,255,0.02)` on `#ffffff` is practically invisible. Conversely, a hardcoded white hover highlight (`rgba(255,255,255,0.04) !important`) does not translate well to light mode, and borders should react cleanly to light/dark themes.

### Theme-Aware Refactoring Strategy:
Define new CSS custom properties in `css/style.css` that represent the nested card backgrounds, ensuring they are light-mode aware (using low opacity dark overlays or light gray fills).

#### Step 1: Update Theme Colors in `css/style.css`
Add the following CSS variables inside the theme declarations:
```css
[data-theme="dark"] {
  /* ... existing variables ... */
  --bg-card-nested: rgba(255, 255, 255, 0.02);
  --bg-card-nested-hover: rgba(255, 255, 255, 0.04);
}

[data-theme="light"] {
  /* ... existing variables ... */
  --bg-card-nested: rgba(0, 0, 0, 0.02);       /* Or #f0f1f3 for a solid background */
  --bg-card-nested-hover: rgba(0, 0, 0, 0.04); /* Or #e8eaed */
}
```

#### Step 2: Replace Hardcoded Backgrounds with Theme Variables

- **In `index.html` (lines 370, 374, 378)**:
  Change:
  `background: rgba(255,255,255,0.02);`
  To:
  `background: var(--bg-card-nested);`

- **In `js/github_stats.js` (line 151)**:
  Change:
  `background:rgba(255,255,255,0.02);`
  To:
  `background:var(--bg-card-nested);`

- **In `css/style.css` (line 2416)**:
  Change:
  `background: rgba(255, 255, 255, 0.04) !important;`
  To:
  `background: var(--bg-card-nested-hover) !important;`

### Additional Theme-Aware Recommendations:
For design consistency, other instances of hardcoded `rgba(255,255,255,0.02)` backgrounds should also be updated to use the new `var(--bg-card-nested)` variable:
- **`js/main.js` (line 302)** (Case Study modal details card list elements):
  `div.style.cssText = "... background:rgba(255,255,255,0.02); ..."` -> change to `var(--bg-card-nested)`
- **`index.html` (line 540)** (Contact form element background):
  `style="... background: rgba(255,255,255,0.02); ..."` -> change to `var(--bg-card-nested)`
