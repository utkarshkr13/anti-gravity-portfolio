# Scope: Implementation Track

## Architecture
The portfolio website is a static HTML/CSS/JavaScript web application supported by automated python synchronization scripts.
- **Frontend Layer**: `index.html` loads styling from `css/style.css` and dynamic features from `js/main.js`, `js/animations.js`, and `js/github_stats.js`.
- **Backend Data Sync Layer**: Python scripts under `scripts/` fetch yfinance stats, GitHub stats, and design spotlights, writing to `assets/*.json`.
- **Integration**: Frontend reads files via `fetch()` and updates the DOM.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| MS1 | Responsive & Layout Polish | Reduce padding under 768px; fix CSS Grid overflow on `#githubReposGrid` and repository cards; fix mobile navbar centering | None | DONE |
| MS2 | Theme Toggling & Contrast | Fix stock ticker readability in light mode; replace hardcoded background overlays on GitHub sub-metrics cards with theme-aware styles | MS1 | DONE |
| MS3 | Asset & Modal/Interactive Fixes | Prevent Lenis scroll bypass; eliminate GSAP filter transition snapping; resolve modal close button header overlap | MS2 | BLOCKED: Forensic audit reported INTEGRITY VIOLATION due to untracked files |
| MS4 | Automation Sync Pipeline Stability | Verify python scripts (`fetch_market.py`, `update_github_stats.py`, `portfolio_auto_upgrade.py`) run successfully | None | PLANNED |
| MS5 | E2E Test Suite Validation | Run all E2E tests and ensure Tiers 1-4 pass 100% | MS1, MS2, MS3, MS4 | PLANNED |
| MS6 | White-box Adversarial Hardening (Tier 5) | Generate and pass Tier 5 adversarial tests, perform forensic audit | MS5 | PLANNED |

## Interface Contracts
### Sync Scripts ↔ Frontend
The sync scripts write to:
- `assets/market.json`
- `assets/github_stats.json`
- `assets/feature_inspiration.json`
The frontend JS reads these files via standard `fetch()` calls and updates the DOM dynamically.
