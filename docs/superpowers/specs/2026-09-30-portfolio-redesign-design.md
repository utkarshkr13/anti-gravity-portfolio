# Portfolio Redesign Design

## Goal

Rebuild the portfolio around a clear, credible story for Business Analyst and Product Analyst roles. The work should be easier to scan than the current effect-heavy presentation, and the featured projects should provide the strongest evidence of Utkarsh's ability to turn operational problems into working tools.

## Source of Truth

The September 2026 resume is authoritative for titles, dates, locations, education, certifications, and measurable outcomes. The supplied website critique is authoritative for page structure and replacement copy. Unsupported claims in the existing site will be removed rather than softened.

Confirmed facts:

- Positioning: Business Analyst / Product Analyst
- Location: Mumbai, India
- SalesCode.ai: Business Analyst, April 2025 to July 2026
- CityFlo: Business Intelligence & Marketing Intern, September 2023 to November 2023
- Medide, VIT Vellore: Research & Data Analytics Head, June 2023 to October 2023
- SalesCode.ai delivery regions: India, Saudi Arabia, and Nepal
- Supported metrics: 40% lower status-tracking effort and 30% lower requirements-drafting time
- Education: B.Tech in Electronics & Communication Engineering, VIT, 2021 to 2025
- Credential: Microsoft Certified Azure Administrator Associate (AZ-104), 2024

## Design Direction

Reading: developer and business-analyst portfolio for recruiters, with a restrained dark editorial language and project-first storytelling.

- Design variance: 6/10
- Motion intensity: 3/10
- Visual density: 4/10
- Theme: near-black throughout
- Text: off-white primary and higher-contrast gray secondary
- Accent: one muted green
- Content width: approximately 1120px
- Shape system: restrained 14px cards and rectangular media
- Typography: existing sans-serif stack, sized for 16 to 18px body copy

No new UI framework or runtime dependency will be introduced. The existing static HTML, CSS, and JavaScript architecture remains appropriate for this site.

## Information Architecture

The page order will be:

1. Hero
2. Featured Work
3. Experience
4. About
5. Credentials
6. Contact

Primary navigation will contain Work, About, and Contact. Resume will remain a separate action. Skills will not be a standalone section; relevant tools will appear within each project. Older projects and credentials will receive less visual weight.

## Hero

The hero will fit within the first viewport and use a split layout. The left side will present:

- Utkarsh Rajput
- I turn requirements into working tools.
- A short explanation of the business-analysis and building overlap
- Mumbai and target-role context
- View My Work and Download Resume actions

The right side will show a readable preview of the SAP Integration Testing Tracker. The oversized name treatment, animated letter reveal, background tunnel, particles, scroll cue, availability pill, cursor trail, and session timer will be removed.

## Featured Work

Two large, vertically stacked project features will replace the narrow sideways project rail and filters.

### SAP Integration Testing Tracker

The case study will explain fragmented spreadsheet and follow-up workflows, the shared tracking solution, Utkarsh's ownership, a decision to centralize visibility, the supported 40% reduction in status-tracking effort, the actual tools used, and a limitation or next improvement. Existing South Africa and unsupported user/hour claims will be removed.

### L2 Client Escalation Portal

The case study will explain email-based escalation tracking, ownership and follow-up problems, the portal solution, Utkarsh's product/implementation decisions, actual technologies, and an honest limitation. Unsupported impact metrics will be removed unless they are independently present in repository evidence.

Each feature will use a large screenshot with explicit dimensions, concise annotations, project-specific tools, and links to the live application and code where available.

## Experience and About

Experience will use the resume's official titles and dates. The SalesCode.ai entry will prioritize requirements, delivery, UAT, integrations, and the two supported improvement metrics. CityFlo and Medide will be compact.

About will use one short biography and one portrait. It will cover the SalesCode.ai context, the link between requirements and internal tools, VIT education, photography, and Formula 1 without repeating the hero.

## Credentials and Contact

Credentials will contain one compact Azure entry and one compact VIT capstone entry. Duplicate Azure certification content will be removed.

Contact will lead with email and LinkedIn. The QR code and contact form will be removed. The section will use a clear invitation and direct links with visible keyboard focus.

## Interaction and Accessibility

- Keep only subtle opacity and transform entrance transitions.
- Honor `prefers-reduced-motion` and make all content visible without animation.
- Use semantic landmarks and heading hierarchy.
- Add a skip link and scroll margins for anchored sections.
- Use links for navigation and actions.
- Give every image meaningful alt text plus explicit width and height.
- Lazy-load below-fold images.
- Provide visible `:focus-visible`, hover, and active states.
- Use `color-scheme: dark` and a matching browser theme color.
- Avoid `transition: all`, hidden cursor behavior, and continuous pointer/scroll loops.

## Implementation Boundaries

The first implementation will rewrite the page structure and primary stylesheet, simplify JavaScript to navigation and restrained reveal behavior, update structured metadata, and synchronize `data/PROFILE.yaml` with the resume. Existing project imagery will be reused. No URL slugs will change, and external project links will be verified before shipping.

## Verification

- Run the repository's automated tests and update assertions only where the intended page structure changed.
- Serve the site locally and inspect desktop and mobile widths with Playwright-based checks.
- Verify keyboard navigation, focus visibility, reduced motion, image loading, and lack of horizontal overflow.
- Run a final Web Interface Guidelines audit.
- Check rendered copy against the resume and scan for stale claims such as Senior PM, Present, South Africa, unsupported metrics, and inconsistent technology lists.

