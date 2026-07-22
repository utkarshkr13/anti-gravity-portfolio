# E2E Test Suite Context

## Environment Details
- **OS**: Windows
- **Node Version**: v24.14.1
- **Python Packages**: requests, yfinance, pandas, numpy, uvicorn, websockets, beautifulsoup4, pyautogui, mss, pillow, etc.
- **Web Browser**: Microsoft Edge (`msedge.exe`) or Google Chrome (`chrome.exe`) in headless mode.

## Project Structure (Target Files)
We MUST NOT modify the following files:
- `index.html`
- `css/style.css`
- `js/main.js`
- `js/animations.js`
- `js/github_stats.js`
- `scripts/fetch_market.py`
- `scripts/update_github_stats.py`
- `scripts/portfolio_auto_upgrade.py`

We can add new files under:
- `tests/` - For all our test code, mocks, and test-runner.
- Project root: `TEST_INFRA.md`, `TEST_READY.md`.

## Interface Contracts (Sync Scripts to UI)
1. `assets/market.json` -> contains `{"tickers": [{"symbol": string, "currency": string, "price": float, "change": float, "change_pct": float, "is_positive": boolean}, ...]}`
2. `assets/github_stats.json` -> contains `{"profile": {"username": string, "public_repos": int, "followers": int, "following": int, "total_stars": int}, "languages": [{"name": string, "percentage": float}, ...], "pinned_repos": [{"name": string, "description": string, "stars": int, "language": string, "url": string}, ...]}`
3. `assets/feature_inspiration.json` -> contains design theme payload.
