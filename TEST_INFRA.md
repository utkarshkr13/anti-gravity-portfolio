# E2E Test Infra: Portfolio

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Navbar Navigation | ORIGINAL_REQUEST §4 | 6 | 1 | ✓ |
| 2 | Project Filtering | ORIGINAL_REQUEST §4 | 4 | - | - |
| 3 | Case Study Modal | ORIGINAL_REQUEST §4 | 3 | 2 | ✓ |
| 4 | Stock Ticker Canvas | ORIGINAL_REQUEST §4 | 2 | 2 | ✓ |
| 5 | GitHub Stats Cards | ORIGINAL_REQUEST §4 | 4 | 1 | ✓ |
| 6 | Theme Switcher | ORIGINAL_REQUEST §4 | 1 | 2 | ✓ |

## Test Architecture
- **Test Server**: A lightweight background daemon HTTP server (`tests/server.py`) running Python's built-in `http.server` to serve the portfolio workspace.
- **Headless Browser Control**: CDPClient (`tests/cdp_client.py`) launches Google Chrome or Microsoft Edge with `--headless=new --remote-debugging-port=9225 --disable-gpu` and controls it via the Chrome DevTools Protocol (CDP) over WebSockets using Python's `websockets` library.
- **Visual Auditing**: Set viewports (320px, 375px, 768px, 1280px) dynamically and capture screenshots of desktop/mobile views (`tests/screenshots/`). Perform color contrast verification on elements (WCAG 2.1 AA) using relative luminance calculation on computed colors.
- **Offline Mock Integration**: Integration tests (`tests/test_sync_scripts.py`) mock `yfinance` and `urllib.request.urlopen` using `unittest.mock` to ensure offline stability, schema conformance, and safe auto-upgrade execution.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full User Journey | Navbar, Ticker, Themes, Filters, Modals, GitHub Links | High |

## Coverage Thresholds
- Tier 1: Feature Coverage (Navbar, filters, modals, stats cards)
- Tier 2: Boundary & Corner cases (320px viewport, tap targets, WCAG text contrast)
- Tier 3: Cross-feature combinations (modal scroll lock, theme-dependent canvas clear, card legibility)
- Tier 4: Real-world application scenarios (integrated E2E journey)
