## 2026-06-16T04:29:03Z
Task: Implement the complete 4-tier E2E testing suite (Tiers 1-4) and Python sync script integration tests for the Portfolio website.

Your workspace is d:\Utkarsh\Python\Side_Quest\Portfolio.
All test files must be created in `d:\Utkarsh\Python\Side_Quest\Portfolio\tests\`.

Ensure that you implement the tests using Python and your newly created CDP client (`tests/cdp_client.py`). Do NOT modify any production portfolio files (index.html, style.css, main.js, animations.js, etc.).

Requirements to implement:

1. Create `tests/test_suite.py` containing a comprehensive test suite (or class) covering:
   - **Tier 1 (Feature Coverage)**:
     - Navbar elements presence and link attributes.
     - Category filters: Click each filter and check if only matching project cards are visible in the DOM (inspect card `style.display` or CSS classes).
     - Case Study Modal: Click project card, verify modal opens (`#projectModal` is active/visible), verify dynamic text injection matches project data, click close button, verify modal closes.
     - Stock Ticker: Verify canvas element exists and check if its size is non-zero.
     - GitHub stats: Verify followers, public repos, language percentages are parsed and injected in the DOM.
   - **Tier 2 (Boundary & Corner Cases)**:
     - Micro-viewports: Set viewport width to 320px (minimum mobile width), 375px (mobile), 768px (tablet), and 1280px (desktop) and verify layout stability.
     - Mobile layout: At 320px and 375px, verify that the mobile menu toggle button is visible, tap targets are >= 48px wide and high (using element bounding box coordinates), and the close button inside the modal is fully visible and clickable (does not overlap text).
     - Text Contrast Verification (WCAG 2.1 AA): Programmatically get the computed background-color and color of primary body text, project card titles, and github stats sub-cards. Using the relative luminance formula (L = 0.2126 * R_L + 0.7152 * G_L + 0.0722 * B_L), calculate the contrast ratio. Verify that in both Light and Dark mode, the contrast ratio is >= 4.5:1.
     - Canvas visibility: In light mode, verify canvas text color adapts to be dark/visible. In dark mode, verify it adapts to be light/visible.
   - **Tier 3 (Cross-Feature Combinations)**:
     - Lenis Scroll Lock: When the case study modal is open, verify that body scroll lock is engaged (check `overflow: hidden` on body or Lenis scroll disabled states). Verify it is unlocked when closed.
     - Theme Switching + Canvas: Toggle theme, verify document attribute updates, check canvas redraw parameters.
     - Theme Switching + GitHub Cards: Toggle theme, check if sub-card background/borders update to maintain legibility.
   - **Tier 4 (Real-World Scenario)**:
     - Full User Journey: Navigate -> scroll page -> toggle theme -> filter by category -> open project modal -> close modal -> click github repo link.

2. Create `tests/test_sync_scripts.py` containing integration tests for Python sync scripts:
   - Use `unittest.mock` to mock `urllib.request.urlopen` and `yfinance.download` so they run offline without making external HTTP requests.
   - Run `fetch_market.py` and `update_github_stats.py` using these mocks.
   - Verify that they write correct JSON schemas to `assets/market.json` and `assets/github_stats.json` matching the interface contracts in PROJECT.md.
   - Run `portfolio_auto_upgrade.py` with mock API data and verify sanity check behavior.
   - Run E2E tests against these generated mock payloads to verify the UI dynamically updates correctly.

3. Update `tests/run_tests.py` to:
   - Launch the HTTP test server and the browser.
   - Run the frontend test suite (`tests/test_suite.py`).
   - Run the sync scripts integration tests (`tests/test_sync_scripts.py`).
   - Print clean, structured test execution logs with PASSED/FAILED signals.
   - Exit with status 0 if all tests pass, or 1 if any fail.

Verify your implementation by running `python tests/run_tests.py` and provide the console output.
