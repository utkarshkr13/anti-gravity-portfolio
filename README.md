# 🚀 Utkarsh Kumar Rajput — Enterprise Product Portfolio

A high-performance, interactive portfolio designed to showcase enterprise product management, business analysis, and full-stack technical delivery. Engineered with a premium, glassmorphic UI, smooth scrolling, and dynamic data integrations.

🔗 **Live Site:** [utkarsh.ind.in](https://www.utkarsh.ind.in/)

---

## 💎 Key Features

### 1. 🧭 Recruiter Command Palette (Ctrl+K / Cmd+K)
Recruiters and hiring managers can access a modern navigation overlay by typing `Ctrl+K` or `Cmd+K`. The command palette supports keyboard-friendly section jumping, direct case-study triggers, and quick action shortcuts.

### 2. 📊 Live Market Data Pipeline
Features an automated, serverless pipeline powered by **GitHub Actions** and **Python (`yfinance` + `pandas`)**. Every hour, a scheduled cron task updates stock ticker data and writes it to `assets/market.json` to feed the live ticker on the page.

### 3. 💼 Bento Grid & Smooth Scroll
Utilizes a modular, Apple/Google-inspired bento grid for the bio details, location widgets, local timezone clocks, and delivery metrics. Integrated with **Lenis** for smooth, native-feeling scrolling.

### 4. 📂 Staggered Transitions & Interactive Accordions
* Character-reveal animations staggered via **GSAP** and **ScrollTrigger**.
* Timeline timelines and case-study disclosures that adjust padding and reveal metrics dynamically.
* Lock scroll on modal overlays to guarantee desktop/mobile layout stability.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: Vanilla HTML5 · CSS3 (Custom Variables, CSS Properties) · ES6+ JavaScript
* **Animation & Motion**: GSAP (GreenSock Animation Platform) · ScrollTrigger · Lenis Smooth Scroll
* **APIs & Data**: yfinance (Yahoo Finance Python API) · GitHub Actions (CI/CD Pipeline)
* **Icons & Assets**: Lucide Icons · Formspree (Serverless Inquiry Triage)

---

## 💻 Setup & Development

Run the portfolio locally in seconds:

```bash
# 1. Clone the repository
git clone https://github.com/utkarshkr13/anti-gravity-portfolio.git
cd anti-gravity-portfolio

# 2. Spin up a local development server
# Python 3
python -m http.server 8000

# Node/npm (alternative)
npx http-server -p 8000
```

Once running, navigate to `http://localhost:8000` in your web browser.
