# Theme Toggling & Contrast Analysis — Milestone 2

This report provides a comprehensive analysis of the theme toggling mechanism, the canvas-based stock ticker text contrast issues, and hardcoded backgrounds/borders in the portfolio codebase, along with non-intrusive strategies to fix them.

---

## 1. Theme Switching Implementation Details

The theme toggling system is built using a dark-first, attribute-based approach:

- **State Attribute**: The active theme state is set on the document root element (`<html>`) using a `data-theme` attribute (e.g., `<html data-theme="dark">` or `<html data-theme="light">`).
- **Initial Load**:
  - Located in `js/main.js` (lines 9-14):
    ```javascript
    const html = document.documentElement;
    const THEME_KEY = 'ukr-portfolio-theme';
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    html.setAttribute('data-theme', savedTheme);
    ```
  - It retrieves the stored preference from `localStorage` under the key `'ukr-portfolio-theme'`. If no preference is found, it defaults to `'dark'`.
- **Toggle Button Listener**:
  - Located in `js/main.js` (lines 16-28):
    - Listens for a `click` event on the button with ID `themeToggle`.
    - Toggles the `data-theme` attribute between `'dark'` and `'light'`.
    - Persists the new value in `localStorage`.
    - Dispatches a custom window event (`'theme-change'`) so other modules (like canvas animations) can react:
      ```javascript
      window.dispatchEvent(new Event('theme-change'));
      ```
- **CSS Styling integration**:
  - Located in `css/style.css` (lines 77-114):
    - Defines custom CSS variables under selector rules `[data-theme="dark"]` and `[data-theme="light"]`.
    - Elements transition colors smoothly thanks to a transition on the body:
      ```css
      transition: background-color var(--theme-transition), color var(--theme-transition);
      ```

---

## 2. Stock Ticker Canvas Contrast Issues & Redraw Strategy

### Current Implementation & Issue
- **File**: `js/animations.js` (lines 37-225).
- **Function**: `initParticles()`.
- **Class**: `TextNode`.
- **Draw Logic**:
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
- **The Contrast Problem**: The node opacity is hardcoded to `this.opacity = 0.05;` inside the `TextNode` constructor (line 85).
  - In **dark mode**, the green/red text at `0.05` opacity on a dark background is faint but legible.
  - In **light mode**, green or red text at `0.05` opacity on a light gray/white background has extremely low contrast, rendering the ticker virtually invisible.

### Strategy to Fix Contrast
To resolve this without altering the tick loop performance, we can leverage the custom `'theme-change'` event dispatched by `js/main.js`.

1. **Read Theme on Initialization**:
   In `TextNode` constructor, check the current theme to determine the initial opacity:
   ```javascript
   const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
   this.opacity = currentTheme === 'light' ? 0.15 : 0.05;
   ```
2. **Listen for Theme Changes**:
   Inside `initParticles()`, add an event listener for `'theme-change'`. When fired, iterate over all existing `TextNode` objects in the `texts` array and update their opacity dynamically:
   ```javascript
   window.addEventListener('theme-change', () => {
     const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
     const opacity = currentTheme === 'light' ? 0.15 : 0.05;
     for (let txt of texts) {
       txt.opacity = opacity;
     }
   });
   ```
   *Note: Using an opacity of `0.15` in light mode increases the contrast of the red/green ticker text against light backgrounds, making it legible without being visually overwhelming.*

---

## 3. Hardcoded Backgrounds & Borders on GitHub Sub-Metrics and Cards

### Current Occurrences of Hardcoded `rgba(255,255,255,0.02)`
A global codebase scan identified several places where `rgba(255,255,255,0.02)` (or similar white-only transparency values) and borders are hardcoded in inline styles:

1. **GitHub Dashboard Sub-Metrics Cards**:
   - **File**: `index.html` (lines 370, 374, 378).
   - **Current Style**: `style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color);"`
   - **Contrast Problem**: In light mode, the parent card background `--bg-card` is white (`#ffffff`). Overlaying `rgba(255,255,255,0.02)` (transparent white) on `#ffffff` results in `#ffffff`, which makes the sub-cards look completely flat and blend invisibly into the parent card.
2. **Dynamic GitHub Repository Cards**:
   - **File**: `js/github_stats.js` (line 151).
   - **Current Style**: `style="... background:rgba(255,255,255,0.02); border:1px solid var(--border-color); ..."`
   - **Contrast Problem**: Similar flatness in light mode.
3. **Case Study Modal Impact Items**:
   - **File**: `js/main.js` (line 302).
   - **Current Style**: `style="... background:rgba(255,255,255,0.02); border:1px solid var(--border-color); ..."`
   - **Contrast Problem**: Dynamically rendered impact list items fade into the white background of the modal in light mode.
4. **Contact Form**:
   - **File**: `index.html` (line 540).
   - **Current Style**: `style="... background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); ..."`
   - **Contrast Problem**: High flatness in light mode.
5. **Hardcoded Button Borders**:
   - **File**: `index.html` (lines 80, 250, 278, 298, 317) & `index.html` (line 611/612).
   - **Current Style**: Overridden inline with `style="... border-color: rgba(255,255,255,0.15);"`
   - **Contrast Problem**: The secondary buttons have a hardcoded semi-transparent *white* border which is completely invisible on light backgrounds. It overrides the theme-aware CSS border rule `[data-theme="light"] .btn-secondary { border-color: rgba(0, 0, 0, 0.15); }`.
6. **Feature Spotlight Star Badge**:
   - **File**: `js/github_stats.js` (line 70).
   - **Current Style**: `style="... background:rgba(255,255,255,0.04); ..."`
   - **Contrast Problem**: Invisible badge background in light mode.

### Strategy to Fix Backgrounds & Borders
To make these elements fully theme-aware and contrast-compliant, we can replace the hardcoded values with CSS variables.

#### Step 1: Define CSS Variables in `css/style.css`
Define new theme variables to handle sub-cards, badges, and button overrides under the respective theme selectors:

```css
[data-theme="dark"] {
  /* ... existing vars ... */
  --bg-sub-card: rgba(255, 255, 255, 0.02);
  --bg-sub-badge: rgba(255, 255, 255, 0.04);
  --btn-secondary-border: rgba(255, 255, 255, 0.15);
}

[data-theme="light"] {
  /* ... existing vars ... */
  --bg-sub-card: rgba(0, 0, 0, 0.02);    /* Soft dark overlay on light bg */
  --bg-sub-badge: rgba(0, 0, 0, 0.04);   /* Soft dark overlay for badges */
  --btn-secondary-border: rgba(0, 0, 0, 0.15); /* Soft dark border for light theme */
}
```

#### Step 2: Update Inline Background Styles
Replace hardcoded `rgba(255,255,255,0.02)` and `rgba(255,255,255,0.04)` with the new variables:

- **In `index.html` (lines 370, 374, 378)**:
  `background: var(--bg-sub-card);`
- **In `index.html` (line 540)**:
  `background: var(--bg-sub-card);`
- **In `js/github_stats.js` (line 70)**:
  `background: var(--bg-sub-badge);`
- **In `js/github_stats.js` (line 151)**:
  `background: var(--bg-sub-card);`
- **In `js/main.js` (line 302)**:
  `background: var(--bg-sub-card);`

#### Step 3: Clean up Button Borders
Update button inline borders in `index.html` to use `--btn-secondary-border`:
- **In `index.html` (lines 80, 250, 278, 298, 317, 612)**:
  Change `border-color: rgba(255,255,255,0.15);` to `border-color: var(--btn-secondary-border);` or remove the inline `border-color` attribute entirely so that the elements correctly inherit styles defined in `.btn-secondary` and `[data-theme="light"] .btn-secondary` in `css/style.css`.
