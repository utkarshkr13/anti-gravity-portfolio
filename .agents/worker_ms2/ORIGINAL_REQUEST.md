## 2026-06-16T04:23:20Z
Objective: Implement Milestone 2: Theme Toggling & Contrast fixes in the Portfolio codebase.

Your working directory is d:\Utkarsh\Python\Side_Quest\Portfolio\.agents\worker_ms2
Your identity is Theme Worker.

Please apply the synthesized changes to the codebase to fix stock ticker legibility in light mode and make hardcoded rgba(255,255,255,0.02) backgrounds and button borders theme-aware:

1. In css/style.css:
   - In the [data-theme="dark"] rule, define:
     --bg-subtle: rgba(255, 255, 255, 0.02);
     --bg-subtle-hover: rgba(255, 255, 255, 0.04);
     --btn-secondary-border: rgba(255, 255, 255, 0.15);
   - In the [data-theme="light"] rule, define:
     --bg-subtle: rgba(0, 0, 0, 0.02);
     --bg-subtle-hover: rgba(0, 0, 0, 0.04);
     --btn-secondary-border: rgba(0, 0, 0, 0.15);
   - Add a class .github-metrics-subcard:
     .github-metrics-subcard {
       padding: 16px;
       background: var(--bg-subtle);
       border-radius: 8px;
       border: 1px solid var(--border-color);
       transition: background-color var(--theme-transition), border-color var(--theme-transition);
     }
   - Update hover styles for github repo card inner container (around line 2416):
     Change background: rgba(255, 255, 255, 0.04) !important;
     To background: var(--bg-subtle-hover) !important;

2. In index.html:
   - Update the three sub-metrics cards under #githubReposGrid (around lines 370-380) to use the helper class class="github-metrics-subcard" instead of the long hardcoded inline style containing padding/background/border. Maintain the style="grid-column: span 2;" override for the third sub-card.
   - Update the contact form (around line 540) to use background: var(--bg-subtle) instead of background: rgba(255,255,255,0.02).
   - In lines 80, 250, 278, 298, 317, 612 (or wherever secondary buttons have inline border-color), replace border-color: rgba(255,255,255,0.15) with border-color: var(--btn-secondary-border).

3. In js/animations.js:
   - In initParticles():
     - Define a local variable: let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
     - Register a window listener on theme-change to update currentTheme and dynamically update the opacity of all existing TextNode instances in the texts array to 0.18 (if theme is light) or 0.05 (if theme is dark):
       window.addEventListener('theme-change', () => {
         currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
         const opacity = currentTheme === 'light' ? 0.18 : 0.05;
         texts.forEach(t => t.opacity = opacity);
       });
     - In TextNode constructor:
       - Set initial opacity based on currentTheme:
         this.opacity = currentTheme === 'light' ? 0.18 : 0.05;
     - In TextNode.draw():
       - Update context fillStyle based on isPositive and currentTheme:
         If currentTheme === 'light':
           positive color is rgba(22, 101, 52, this.opacity) (dark forest green)
           negative color is rgba(185, 28, 28, this.opacity) (dark red)
         If currentTheme === 'dark' (or default):
           positive color is rgba(34, 197, 94, this.opacity) (neon green)
           negative color is rgba(239, 68, 68, this.opacity) (CNBC red)

4. In js/github_stats.js:
   - Line 70 (feature spotlight badge background): replace rgba(255,255,255,0.04) with var(--bg-subtle-hover).
   - Line 151 (github card inner background): replace background:rgba(255,255,255,0.02) with background:var(--bg-subtle).

5. In js/main.js:
   - Line 302 (dynamic modal details elements): replace background:rgba(255,255,255,0.02) with background:var(--bg-subtle).
