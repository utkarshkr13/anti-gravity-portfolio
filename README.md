# Utkarsh Kumar Rajput — Portfolio

A focused portfolio for product management, business analysis, enterprise delivery, and practical internal tools.

**Live site:** [utkarsh.ind.in](https://www.utkarsh.ind.in/)

## Highlights

- Product, workflow, and enterprise-delivery experience presented through clear case studies.
- Responsive navigation with keyboard support, visible focus states, and an accessible mobile menu.
- Dark and light themes.
- Project filtering, case-study dialogs, smooth in-page navigation, and a contact form powered by Formspree.
- An adaptive **Liquid Titanium** hero: a dependency-free WebGL surface with cursor response, blue reflections, light-theme support, reduced-motion support, off-screen pausing, WebGL recovery, and adaptive resolution.

## Technology

- HTML, CSS, and modern browser JavaScript
- GSAP, ScrollTrigger, Flip, and Lenis for progressive enhancement
- Lucide for icons
- Formspree for contact-form delivery
- GitHub Pages for hosting

The essential portfolio content remains usable if optional animation libraries or WebGL are unavailable.

## Run locally

```bash
git clone https://github.com/utkarshkr13/anti-gravity-portfolio.git
cd anti-gravity-portfolio
node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((req,res)=>fs.readFile(path.join(process.cwd(),req.url==='/'?'index.html':req.url),(e,d)=>e?(res.writeHead(404),res.end()):res.end(d))).listen(4173)"
```

Open [http://localhost:4173](http://localhost:4173).

## Project structure

```
assets/     Images, résumé, QR code, and generated data
css/        Base styling and interface refinements
js/         Navigation, interactions, animation, and Liquid Titanium renderer
index.html  Portfolio markup and integration points
```

## Deployment

Pushes to `main` are published through GitHub Pages. The custom domain is configured in `CNAME`.

## Contact

- Email: [hello@utkarsh.ind.in](mailto:hello@utkarsh.ind.in)
- LinkedIn: [Utkarsh Kumar Rajput](https://linkedin.com/in/utkarsh-kumar-rajput)
