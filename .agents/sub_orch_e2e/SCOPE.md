# Scope: E2E Testing Track

## Architecture
The E2E Testing Track provides opaque-box, requirement-driven verification of the Portfolio application layout, interactivity, script correctness, and responsiveness.
- **Test Server**: A lightweight Python-based HTTP server to serve the static portfolio frontend files.
- **Headless Browser Control**: Uses Google Chrome or Microsoft Edge running in `--headless --remote-debugging-port=9222` mode, controlled via the Chrome DevTools Protocol (CDP) over WebSockets using Python's `websockets` library.
- **Visual Auditing**: Takes screenshots at critical viewports and applies PIL/Pillow image analysis to verify layout positions, light/dark mode color contrast, and canvas/ticker readability.
- **Execution Engine**: A pure Python test runner (`tests/run_tests.py`) that executes test cases sequentially, captures failures, outputs structured clean logs, and runs mock-based verification of local backend scripts.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Test Infrastructure Setup | Verify browser executable, implement CDP client (`cdp_client.py`), start local HTTP test server, create runner scaffold | None | DONE |
| M2 | Tier 1 (Feature Coverage) | Test basic navbar, grid filters, case study modal open/close, yfinance ticker canvas, GitHub stats cards | M1 | DONE |
| M3 | Tier 2 (Boundary & Corner Cases) | Test micro-viewports (320px), mobile navbar toggle, tap target sizing, flat/invisible card boundary styles, close button overlay | M2 | DONE |
| M4 | Tier 3 (Cross-Feature Combinations) | Test scroll lock (Lenis bypass) on modal open/close, theme switching (Light/Dark contrast of ticker and github cards), resize with open modal | M3 | DONE |
| M5 | Tier 4 (Real-World Scenarios) | Execute E2E user journey: land -> scroll -> change theme -> filter -> open modal -> close modal -> click github repo link | M4 | DONE |
| M6 | Python Sync Script Verification | Mock API requests, execute `fetch_market.py` and `update_github_stats.py`, verify JSON formats and frontend update | M5 | DONE |
| M7 | Forensics & Publishing | Run complete E2E suite, run Forensic Auditor verification, publish `TEST_INFRA.md` and `TEST_READY.md` | M6 | DONE |


## Interface Contracts
- **Chrome DevTools Protocol (CDP)**: The Python test script connects to `ws://127.0.0.1:9222/devtools/page/...` to execute JavaScript, query computed styles, get layout bounding boxes, and capture PNG screenshots.
- **Mock Sync Outputs**: Mocked backend JSON files written to `assets/` must match the exact schemas required by the frontend scripts (`main.js`, `github_stats.js`).
