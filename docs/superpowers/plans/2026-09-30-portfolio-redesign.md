# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the effect-heavy portfolio with a credible, project-first Business Analyst / Product Analyst portfolio and publish it to GitHub.

**Architecture:** Keep the static site architecture. `index.html` owns semantic content, `css/style.css` owns the single dark visual system, `js/main.js` owns navigation and restrained progressive enhancement, and `data/PROFILE.yaml` remains the structured content source for maintenance scripts.

**Tech Stack:** Semantic HTML5, modern CSS, vanilla JavaScript, Python unittest, Playwright/CDP browser checks

## Global Constraints

- Resume facts override conflicting existing claims.
- Use a near-black theme, off-white text, one muted green accent, and an approximately 1120px content width.
- Page order: Hero, Featured Work, Experience, About, Credentials, Contact.
- Primary navigation: Work, About, Contact, plus a separate Resume link.
- No new runtime dependency or UI framework.
- No cursor trail, session timer, animated letter reveal, particle field, filters, QR code, or contact form.
- Support keyboard focus, reduced motion, responsive layout, and explicit image dimensions.
- Push only after tests and browser verification pass.

---

### Task 1: Add Content-Contract Tests

**Files:**
- Create: `tests/test_portfolio_content.py`
- Test: `tests/test_portfolio_content.py`

**Interfaces:**
- Consumes: `index.html` and `data/PROFILE.yaml` as UTF-8 text.
- Produces: regression checks for required facts, removed claims, navigation, section order, image dimensions, and removed decorative features.

- [ ] **Step 1: Write failing tests**

Create unittest assertions that require `Business Analyst`, `Product Analyst`, `April 2025`, `July 2026`, the two featured project titles, `40%`, `30%`, navigation links for `#work`, `#about`, and `#contact`, and ordered section ids. Assert that `Senior PM`, `Present`, `South Africa`, `cursor-dot`, `sessionTimer`, `linkedin_qr`, `<form`, and `transition: all` do not occur in production files. Parse every `<img>` tag and require `width` and `height` attributes.

- [ ] **Step 2: Run tests and verify failure**

Run: `python -m unittest tests.test_portfolio_content -v`

Expected: failures for stale copy, old sections, and missing content contract.

- [ ] **Step 3: Commit tests**

Run:

```powershell
git add tests/test_portfolio_content.py
git commit -m "test: define portfolio redesign contract"
```

### Task 2: Rebuild Page Content and Visual System

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `data/PROFILE.yaml`
- Delete references only: `css/ui-revamp.css`, `js/cursor.js`, `js/animations.js`, `js/magnetic.js`, `js/liquid-titanium.js`, `js/glow.js`

**Interfaces:**
- Consumes: resume facts, existing images in `assets/`, existing project URLs.
- Produces: semantic single-page portfolio with ids `hero`, `work`, `experience`, `about`, `credentials`, and `contact`.

- [ ] **Step 1: Replace `index.html`**

Build a semantic document containing a skip link, sticky navigation, split hero, two large project case studies, compact experience, portrait-led about section, compact credentials, and direct contact links. Use real resume facts and remove unsupported metrics. Add JSON-LD with `Business Analyst and Product Analyst`, Mumbai, email, LinkedIn, and GitHub. Give all images `alt`, `width`, and `height`; lazy-load below-fold images.

- [ ] **Step 2: Replace `css/style.css`**

Define tokens for `#090b0a` background, `#f2f4ef` text, `#aeb7ae` secondary text, and `#8caf86` accent. Use an 1120px container, 14px radius system, rectangular screenshots, responsive grids, explicit hover/active/focus-visible states, and only opacity/transform transitions. Add reduced-motion rules, safe-area padding, anchor scroll margins, and mobile layouts at 900px and 640px.

- [ ] **Step 3: Synchronize `data/PROFILE.yaml`**

Set the role to `Business Analyst / Product Analyst`, availability to business analyst and product analyst opportunities, and SalesCode.ai dates to `Apr 2025 - Jul 2026`. Replace unsupported project/client/metric claims with the approved factual descriptions and project-specific tools.

- [ ] **Step 4: Run content tests**

Run: `python -m unittest tests.test_portfolio_content -v`

Expected: PASS.

- [ ] **Step 5: Commit content and styles**

Run:

```powershell
git add index.html css/style.css data/PROFILE.yaml
git commit -m "feat: rebuild portfolio around featured work"
```

### Task 3: Simplify Progressive Enhancement

**Files:**
- Modify: `js/main.js`
- Test: `tests/test_portfolio_content.py`

**Interfaces:**
- Consumes: `.site-nav`, `.nav-toggle`, `[data-reveal]`, and section anchors from `index.html`.
- Produces: accessible mobile navigation, current-year footer value, and reduced-motion-safe reveal behavior.

- [ ] **Step 1: Add JavaScript contract assertions**

Require `matchMedia('(prefers-reduced-motion: reduce)')`, `IntersectionObserver`, `aria-expanded`, and Escape-key handling. Reject pointermove and continuous animation-frame loops.

- [ ] **Step 2: Replace `js/main.js`**

Implement mobile menu toggle with `aria-expanded`, close on link selection and Escape, set the footer year, and reveal `[data-reveal]` elements with IntersectionObserver only when reduced motion is not requested. Ensure content remains visible without JavaScript.

- [ ] **Step 3: Run tests**

Run: `python -m unittest tests.test_portfolio_content tests.test_suite -v`

Expected: PASS.

- [ ] **Step 4: Commit JavaScript**

Run:

```powershell
git add js/main.js tests/test_portfolio_content.py
git commit -m "refactor: simplify portfolio interactions"
```

### Task 4: Browser QA, Audit, and Push

**Files:**
- Modify if needed: `index.html`, `css/style.css`, `js/main.js`, `tests/test_portfolio_content.py`
- Update: `tests/screenshots/desktop_view.png`
- Update: `tests/screenshots/mobile_view.png`

**Interfaces:**
- Consumes: completed static site.
- Produces: verified desktop/mobile screenshots and a pushed `main` branch.

- [ ] **Step 1: Run full automated suite**

Run: `python tests/run_tests.py`

Expected: all applicable tests pass. Update obsolete test assertions only where the approved page structure intentionally changed.

- [ ] **Step 2: Start local server and run browser checks**

Run: `python tests/server.py` and inspect 1440x1000 and 390x844 viewports using the repository's Playwright/CDP utilities. Verify no horizontal overflow, nav operation, keyboard focus, readable screenshots, and expected section order.

- [ ] **Step 3: Audit Web Interface Guidelines**

Check `index.html`, `css/style.css`, and `js/main.js` for image dimensions, semantic controls, focus visibility, reduced motion, `transition: all`, touch behavior, theme color, and dark color scheme. Fix every applicable issue.

- [ ] **Step 4: Scan credibility regressions**

Run:

```powershell
rg -n "Senior PM|Present|South Africa|CCBCSA|40\+ daily|15 hours/week|cursor-dot|sessionTimer|linkedin_qr|<form|transition:\s*all" index.html css/style.css js/main.js data/PROFILE.yaml
```

Expected: no matches.

- [ ] **Step 5: Commit QA fixes and push**

Run:

```powershell
git add index.html css/style.css js/main.js data/PROFILE.yaml tests
git commit -m "test: verify responsive portfolio redesign"
git push origin main
```

Expected: GitHub reports `main -> main`.
