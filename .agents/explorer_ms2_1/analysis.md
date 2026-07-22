# Theme Toggling and Contrast Analysis Report

## Executive Summary
This report analyzes the theme switching mechanism and specific visual contrast issues identified for Milestone 2 in the Portfolio codebase. Strategies are formulated to make the stock ticker canvas text readable across dark and light modes, and to replace hardcoded, non-theme-aware backgrounds and borders on GitHub sub-metrics cards and other elements with theme-aware alternatives.

---

## 1. Theme Switching Implementation
The theme switching mechanism in the website is managed inside `js/main.js` and behaves as follows:

*   **State Store & Attribute Selection**: The current theme (either `'dark'` or `'light'`) is applied as a custom data attribute `data-theme` on the root HTML element (`document.documentElement`).
*   **Persistent Storage**: The theme preference is stored in `localStorage` under the key `'ukr-portfolio-theme'`. If no theme is saved, it defaults to `'dark'`.
*   **Event Handling**: A click event listener is attached to the theme toggle button with the ID `themeToggle`. When clicked:
    1.  The `data-theme` attribute on the `<html>` element is toggled between `'dark'` and `'light'`.
    2.  The new value is written to `localStorage`.
    3.  A custom event named `'theme-change'` is dispatched globally on `window`:
        ```javascript
        window.dispatchEvent(new Event('theme-change'));
        ```
        This global event allows decoupled components (like the Canvas particles system) to listen and react immediately to theme transitions.

---

## 2. Hero Ticker Canvas Contrast (animations.js)
### Location of Drawing Logic
The stock ticker canvas drawing logic is implemented in `js/animations.js` within the `initParticles()` function (lines 37–225).
*   **Canvas Element**: Target ID `#heroGlobe` (initialized around line 38).
*   **Drawing Class**: The `TextNode` class represents each stock ticket item.
*   **Text Color & Opacity**: The drawing logic is handled inside the `draw()` method:
    ```javascript
    draw() {
      if (this.isPositive) {
        ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity})`; // Neon Green
      } else {
        ctx.fillStyle = `rgba(239, 68, 68, ${this.opacity})`; // CNBC Red
      }
      ctx.fillText(this.text, this.x, this.y);
    }
    ```
    Currently, `this.opacity` is hardcoded to `0.05` in the constructor.

### Issue Statement
In light mode, the canvas is displayed over a light background (`#f8f9fa`). Faint neon green (`rgba(34, 197, 94, 0.05)`) and faint red (`rgba(239, 68, 68, 0.05)`) text have extremely low contrast and are completely illegible/invisible to users.

### Proposed Strategy
To solve this without degrading loop performance, we should tap into the global `'theme-change'` event and update the drawing colors and opacity dynamically:
1.  **State Variable**: Define a variable `currentTheme` within the scope of `initParticles()`:
    ```javascript
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    ```
2.  **Event Registration**: Register an event listener on `window` to track theme updates:
    ```javascript
    window.addEventListener('theme-change', () => {
      currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    });
    ```
3.  **Dynamic Style Adjustment**: Refactor the `TextNode.draw()` method to use distinct opacities and darker, high-contrast colors in light mode:
    ```javascript
    draw() {
      const isLight = currentTheme === 'light';
      const opacity = isLight ? 0.15 : 0.05; // Increase opacity in light mode for better readability
      
      if (this.isPositive) {
        // Darker green in light mode, bright neon green in dark mode
        ctx.fillStyle = isLight 
          ? `rgba(22, 101, 52, ${opacity})` 
          : `rgba(34, 197, 94, ${opacity})`;
      } else {
        // Darker red in light mode, bright red in dark mode
        ctx.fillStyle = isLight 
          ? `rgba(185, 28, 28, ${opacity})` 
          : `rgba(239, 68, 68, ${opacity})`;
      }
      ctx.fillText(this.text, this.x, this.y);
    }
    ```

---

## 3. GitHub Cards and Sub-metrics Hardcoded Values
### Location of Hardcoded Styles
The background value `rgba(255,255,255,0.02)` and inline borders are used in multiple places across the codebase:
1.  **GitHub Profile Analytics Sub-metrics (HTML)**:
    *   `index.html:370`: Inline background and border style for the **Public Repos** card.
    *   `index.html:374`: Inline background and border style for the **Total Stars** card.
    *   `index.html:378`: Inline background and border style for the **Followers** card.
2.  **Contact Form Background (HTML)**:
    *   `index.html:540`: Inline style containing `background: rgba(255,255,255,0.02)` for the `.contact-form` element.
3.  **GitHub Pinned Repository Cards (JS)**:
    *   `js/github_stats.js:151`: Inline styling applied dynamically to `.github-repo-card-inner`.
4.  **Project Case Study Modals (JS)**:
    *   `js/main.js:302`: Inline background styled dynamically on Modal Impact lists (KPI items).
5.  **Repository Card Hover Background (CSS)**:
    *   `css/style.css:2416`: Hardcoded `background: rgba(255, 255, 255, 0.04) !important` on `.github-repo-card:hover .github-repo-card-inner`.

### Issue Statement
In light mode, the primary card background is white (`#ffffff`) and the page background is light gray (`#f8f9fa`). Because `rgba(255,255,255,0.02)` represents a white background overlay with $2\%$ opacity, it renders the sub-cards completely flat, making them indistinguishable from their containers. The border `rgba(0,0,0,0.06)` is also extremely faint, contributing to the lack of visual boundaries.

### Proposed Strategy
To cleanly support theme toggling:
1.  **Add CSS Variables**: Define new design tokens in `css/style.css` for subtle card backgrounds:
    ```css
    /* In [data-theme="dark"] block */
    --bg-subtle: rgba(255, 255, 255, 0.02);
    --bg-subtle-hover: rgba(255, 255, 255, 0.04);

    /* In [data-theme="light"] block */
    --bg-subtle: rgba(0, 0, 0, 0.02);
    --bg-subtle-hover: rgba(0, 0, 0, 0.04);
    ```
2.  **Consolidate Sub-metrics CSS Classes**: Clean up the inline styles in `index.html` by declaring a helper class in `css/style.css`:
    ```css
    .github-metrics-subcard {
      padding: 16px;
      background: var(--bg-subtle);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      transition: background-color var(--theme-transition), border-color var(--theme-transition);
    }
    ```
    Then, refactor `index.html` (lines 370, 374, 378) to:
    ```html
    <div class="github-metrics-subcard">...</div>
    <div class="github-metrics-subcard">...</div>
    <div class="github-metrics-subcard" style="grid-column: span 2;">...</div>
    ```
3.  **Refactor Dynamic JS Styles**:
    *   In `js/github_stats.js:151`, change inline styling to leverage `--bg-subtle` or completely move style definitions to `.github-repo-card-inner` class in CSS, keeping the HTML template string clean:
        ```javascript
        // Change from: background:rgba(255,255,255,0.02)
        // Change to:   background:var(--bg-subtle)
        ```
    *   In `js/main.js:302`, update the dynamic CSS text:
        ```javascript
        div.style.cssText = "padding:12px; background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:8px;";
        ```
4.  **Refactor Contact Form & Hover Styles**:
    *   In `index.html:540`, replace `background: rgba(255,255,255,0.02)` with `background: var(--bg-subtle)`.
    *   In `css/style.css:2416`, update hover style:
        ```css
        .github-repo-card:hover .github-repo-card-inner {
          background: var(--bg-subtle-hover) !important;
        }
        ```
