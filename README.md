# Utkarsh Rajput — Portfolio

Personal portfolio for business analysis, internal tools, and data projects.

**Live site:** https://www.utkarsh.ind.in/

## Frontend

- Static semantic HTML, one stylesheet (`css/portfolio.css`), and one deferred script (`js/portfolio.js`).
- No framework, build step, CDN scripts, webfonts, canvas effects, or scroll hijacking.
- Responsive project layouts, dark/light themes, project filters, and native project-note dialogs.
- Content, contact links, navigation, and expandable project notes work without JavaScript.
- Keyboard focus, modal focus restoration, reduced motion, and accessible filter announcements.

Legacy styles and scripts remain in the repository for reference but are not loaded by the page. Scheduled data-refresh workflows remain unchanged; their cached data is not displayed.

## Local preview

```sh
python -m http.server 4173
```

Open http://localhost:4173.

## Checks

With the local server running:

```sh
npm ci
npx playwright install chromium
npm run check
npm test
```

The browser check covers desktop/mobile overflow, both themes, image loading, filtering, keyboard dialogs, theme persistence, reduced motion, and the no-JavaScript fallback.

## Content

Edit `index.html` for visible copy; keep `data/PROFILE.yaml` aligned with profile changes. Project-note content lives in native `details` elements in the HTML and is reused by the dialog.

The repository currently has no résumé PDF. The page uses an email request link. Add a current PDF before introducing a download link. Project imagery is labeled as a preview. Numerical performance claims have been omitted pending supporting measurements.

## Deployment

The site uses GitHub Pages with the custom domain in `CNAME`. Merge the redesign branch through a pull request to publish it through the existing deployment setup.
