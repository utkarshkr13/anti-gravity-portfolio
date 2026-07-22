# Handoff Report — Theme Toggling & Contrast Issues (Milestone 2)

## 1. Observation
We observed the following files, line numbers, and behavior in the workspace `d:\Utkarsh\Python\Side_Quest\Portfolio\`:

*   **Theme Switch Implementation (`js/main.js:8-28`)**:
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

*   **Stock Ticker Canvas Logic (`js/animations.js:37-225`)**:
    *   Inside `initParticles()` (line 37), text nodes are created using the class `TextNode`.
    *   At lines 73 and 133–140, the ticker text is drawn:
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
        And `this.opacity` is hardcoded to `0.05` in the constructor.

*   **Hardcoded Backgrounds and Borders**:
    *   **`index.html` (lines 370, 374, 378)**:
        ```html
        <div style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color);">
        ```
    *   **`index.html` (line 540)**:
        ```html
        <form ... style="... background: rgba(255,255,255,0.02); ...">
        ```
    *   **`js/github_stats.js` (line 151)**:
        ```javascript
        <div class="github-repo-card-inner" style="padding:20px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); ...">
        ```
    *   **`js/main.js` (line 302)**:
        ```javascript
        div.style.cssText = "padding:12px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px;";
        ```
    *   **`css/style.css` (line 2416)**:
        ```css
        background: rgba(255, 255, 255, 0.04) !important;
        ```

---

## 2. Logic Chain
1.  **Theme Switch Event**: The theme switcher updates the root `<html>` attribute `data-theme` and broadcasts a custom `'theme-change'` event on the global `window` object. This makes it possible to listen to theme changes without polling or tight coupling.
2.  **Ticker Canvas Contrast**: In light mode, the canvas is displayed on a light background. Faint text drawn at `opacity = 0.05` with bright/neon green and bright red is completely illegible. Raising the opacity to `0.15` and shifting the colors to darker variations (e.g. forest green and deep red) dynamically when `currentTheme === 'light'` guarantees high readability.
3.  **GitHub Cards and Sub-metrics Flatness**: The sub-metrics card background `rgba(255,255,255,0.02)` is a white-based alpha value. When placed over a pure white card (`#ffffff`) in light mode, it yields pure white, stripping away all contrast and layout bounds. Using a CSS variable `--bg-subtle` that dynamically switches to a dark alpha value (`rgba(0,0,0,0.02)`) in light mode resolves the flatness while maintaining consistency with the dark theme.

---

## 3. Caveats
*   We did not perform actual modifications on code files as we are a read-only explorer.
*   Assumed that `window.devicePixelRatio` scaling does not alter the color output on the canvas, which is standard.

---

## 4. Conclusion
We have identified the root causes of the contrast issues in both the Canvas ticker and GitHub sub-metrics cards, and mapped them to their exact file paths and lines. The proposed strategy utilizes the already existing `'theme-change'` window event to dynamically swap canvas font colors/opacity, and introduces the design tokens `--bg-subtle` and `--bg-subtle-hover` to replace hardcoded values.

---

## 5. Verification Method
1.  Verify the presence of theme switching event dispatch logic in `js/main.js` at line 26.
2.  Verify the hardcoded `0.05` opacity and color strings in `js/animations.js` at lines 85 and 133–140.
3.  Inspect the inline style `rgba(255,255,255,0.02)` in `index.html` (lines 370, 374, 378), `js/github_stats.js` (line 151), and `js/main.js` (line 302) to verify they are currently static.
