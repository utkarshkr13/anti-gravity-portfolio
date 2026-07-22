# E2E Test Suite Implementation Plan

This document outlines the step-by-step execution plan for the E2E Testing Track of the Portfolio project.

## Phase 1: Planning and Decomposition
- [x] Create ORIGINAL_REQUEST.md, BRIEFING.md, and progress.md
- [ ] Investigate the existing codebase and dependency structure
- [ ] Identify browser testing mechanism (Headless Chrome/Edge via Chrome DevTools Protocol (CDP) over WebSockets)
- [ ] Initialize SCOPE.md with detailed milestone decomposition (Tiers 1-4 + Infra + Scripts)
- [ ] Initialize context.md in the agent directory

## Phase 2: Test Infrastructure Setup
- [ ] Spawn teamwork_preview_worker to:
  - Verify Chrome/Edge executable availability on the Windows host.
  - Implement a basic CDP-based Python client (`tests/cdp_client.py`) that can start/stop headless browser, navigate, execute JS, get element positions, and take screenshots.
  - Implement a local HTTP test server (`tests/server.py`) using Python's built-in `http.server` to serve the portfolio workspace.
  - Establish a basic test runner scaffold (`tests/run_tests.py`) that runs tests, aggregates results, and logs outcomes.
- [ ] Spawn teamwork_preview_reviewer to review the infrastructure.

## Phase 3: Tier 1 & 2 Test Implementation (Feature & Boundary Coverage)
- [ ] Spawn teamwork_preview_worker to write test cases:
  - **Tier 1 (Feature Coverage)**:
    - Navbar functionality (navigation, smooth scroll).
    - Grid filtration (filter by categories, active states).
    - Case Study Modal (opening, closing, content dynamic injection).
    - Stock Ticker (canvas renders, animation active).
    - GitHub Stats Cards (injection of repos, stats).
    - Design Spotlight Banner (injection of dynamic inspiration colors/fonts).
  - **Tier 2 (Boundary & Corner Cases)**:
    - Micro-viewports (responsiveness at 320px, 375px, etc.).
    - Mobile navbar menu button toggle and tap target sizes (>= 48px).
    - Flat/invisible card boundary styles.
    - Close button clickability and overlaps in small screens.
- [ ] Spawn teamwork_preview_reviewer to verify Tier 1 & 2 tests.
- [ ] Spawn teamwork_preview_challenger to run/verify these tests and ensure they capture regressions.

## Phase 4: Tier 3 & 4 Test Implementation (Combinations & Scenarios)
- [ ] Spawn teamwork_preview_worker to write test cases:
  - **Tier 3 (Cross-feature Combinations)**:
    - Modal opening while Lenis scrolling is active (verify Lenis bypass/scroll lock toggles correctly).
    - Theme switching (Light/Dark mode contrast checks, verifying color changes propagate to canvas and GitHub sub-cards).
    - Resizing viewport while modal is open (verifying close button remains visible and clickable).
  - **Tier 4 (Real-world Scenarios)**:
    - Full user journey: User lands -> scrolls page -> toggles theme -> filters projects -> opens modal -> closes modal -> clicks github repo link.
- [ ] Spawn teamwork_preview_reviewer and challenger to verify.

## Phase 5: Python Sync Script Verification (Integration Tests)
- [ ] Spawn teamwork_preview_worker to:
  - Mock API requests for yfinance and GitHub API to avoid network calls (keeping with CODE_ONLY mode).
  - Execute `scripts/fetch_market.py` and `scripts/update_github_stats.py` with mock responses.
  - Verify JSON payloads are written to `assets/` and conform to interface contracts.
  - Verify that the frontend updates correctly when using the newly generated payloads.
- [ ] Spawn teamwork_preview_reviewer and challenger to verify.

## Phase 6: Final Hardening, Forensic Audit & Publishing
- [ ] Run the complete E2E test suite.
- [ ] Spawn teamwork_preview_auditor to run forensics checks (no hardcoded test results, no dummy files, clean execution).
- [ ] Publish TEST_INFRA.md and TEST_READY.md at project root.
- [ ] Write handoff.md and send final report to parent.
