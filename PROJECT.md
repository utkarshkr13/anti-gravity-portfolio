# Project: Portfolio Visual Audit and Responsive Polish

## Architecture
The portfolio website is a static HTML/CSS/JavaScript web application supported by automated python synchronization scripts.
- **Frontend Layer**: `index.html` loads styling from `css/style.css` and dynamic features from `js/main.js`, `js/animations.js`, and `js/github_stats.js`. Third-party libraries loaded via CDN include GSAP, Lenis, and Lucide.
- **Backend Data Sync Layer**: Python scripts under `scripts/` fetch yfinance stats, GitHub stats, and design spotlights. They write local JSON caches into `assets/`, which are committed and deployed to the GitHub repository automatically.
- **Data flow**: Python Sync Script -> API Requests -> assets/*.json -> JS Fetch -> HTML DOM update.

## Code Layout
- `index.html` - Core markup and inline layouts (including grid styling).
- `css/style.css` - Custom styles, responsive breakpoints, variable definitions, and modal layouts.
- `js/main.js` - Application coordinator, handles Lenis scrolling, case study modal population/interactions, and filter logic.
- `js/animations.js` - Canvas-based stock market tickers and GSAP triggers.
- `js/github_stats.js` - Injects dynamic git profile info, language breakdown, and design spotlight.
- `scripts/` - Local python scripts: `fetch_market.py`, `update_github_stats.py`, `portfolio_auto_upgrade.py`.
- `assets/` - Static JSON caches (`market.json`, `github_stats.json`, `feature_inspiration.json`) and media.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | E2E Testing Track | Implement 4-tier E2E testing suite and test runner; output `TEST_READY.md` | None | IN_PROGRESS (eeaf51e5-3307-4b3f-af50-99e81a36fa62) |
| M2 | Responsive & Layout Polish | Fix card padding squeeze, grid column breakout, and navbar centering at viewport width down to 320px | None | IN_PROGRESS (fca60abc-4a07-45a9-aa95-8011184acc8c) |
| M3 | Contrast & Readability | Solve stock ticker visibility in light mode and flat/invisible sub-cards in light mode | None | IN_PROGRESS (fca60abc-4a07-45a9-aa95-8011184acc8c) |
| M4 | Asset & Modal Fixes | Correct Lenis body scroll bypass, grid transition snapping, and close button text overlap; verify Lucide icons | None | IN_PROGRESS (fca60abc-4a07-45a9-aa95-8011184acc8c) |
| M5 | Sync Pipeline Verification | Verify yfinance, github stats, and design inspiration python scripts run successfully and interface with UI | None | IN_PROGRESS (fca60abc-4a07-45a9-aa95-8011184acc8c) |
| M6 | Final Verification & Hardening | Execute E2E tests across all tiers, run adversarial white-box tests (Tier 5), perform Forensic Audit verification | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts
### Sync Scripts ↔ Frontend
The sync scripts write to:
- `assets/market.json` (List of objects: `{"symbol": string, "name": string, "price": float, "change": float, "is_positive": boolean}`)
- `assets/github_stats.json` (Object: `{"followers": int, "following": int, "public_repos": int, "total_stars": int, "languages": Object, "pinned_repos": List}`)
- `assets/feature_inspiration.json` (Object: `{"name": string, "url": string, "stars": int, "primaryColor": string}`)
The frontend JS reads these files via standard `fetch()` calls and updates the DOM dynamically.
