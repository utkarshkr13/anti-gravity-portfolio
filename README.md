# 🚀 Utkarsh Kumar Rajput — Portfolio

A high-performance, interactive portfolio featuring a live financial ticker, glassmorphism UI, Lenis smooth-scrolling, GSAP animations, and **15 hidden interactive Easter eggs**. Inspired by Apple and Google design philosophy.

🔗 **Live Site:** [utkarsh.ind.in](https://www.utkarsh.ind.in/)

**Tech Stack:** Vanilla HTML / CSS / JS · GSAP · Lenis · yfinance (Python)

---

## 📈 Live Market Ticker

The hero background auto-scrolls **45 real financial tickers** with live price data, powered by a **Python / yfinance GitHub Actions pipeline** that refreshes `market.json` every hour.

### Tracked Symbols

| Category | Tickers |
|---|---|
| **🇺🇸 US Tech** | `AAPL` · `MSFT` · `NVDA` · `GOOGL` · `TSLA` · `META` · `AMZN` · `NFLX` · `AMD` · `INTC` · `ORCL` · `IBM` · `CRM` · `ADBE` · `QCOM` · `CSCO` |
| **🇺🇸 US Finance & Consumer** | `JPM` · `V` · `MA` · `WMT` · `DIS` · `UBER` |
| **₿ Crypto** | `BTC-USD` · `ETH-USD` · `SOL-USD` · `BNB-USD` |
| **🇮🇳 Nifty 50 (India `.NS`)** | `RELIANCE` · `TCS` · `INFY` · `HDFCBANK` · `SBIN` · `WIPRO` · `HCLTECH` · `TECHM` · `LT` · `ICICIBANK` · `AXISBANK` · `KOTAKBANK` · `BAJFINANCE` · `MARUTI` · `SUNPHARMA` · `ITC` · `ASIANPAINT` · `HINDUNILVR` · `BHARTIARTL` |

---

## 🥚 Hidden Easter Eggs (15 Total)

Fifteen interactive surprises are engineered into the frontend for developers and recruiters to discover.

### ✨ Original Five

| # | Name | Activation | Effect |
|---|---|---|---|
| 1 | **🚀 Matrix Hyperdrive** | Click the hero name **"Utkarsh"** 5× rapidly | All tickers turn neon green, scroll velocity × 35 |
| 2 | **🎮 Konami Code (Anti-Gravity)** | Type `↑ ↑ ↓ ↓ ← → ← → B A` | All UI elements float away off-screen |
| 3 | **🎉 "hire" Command** | Type `hire` anywhere on the page | Massive confetti explosion |
| 4 | **⛈️ "salescode" Thunderstorm** | Type `salescode` | Lightning flashes + HTML5 Canvas rain |
| 5 | **👨‍💻 Hacker Console Signature** | Open `F12` → Console | ASCII art "UTKARSH" in blue with welcome message |

### 🔥 Ten Advanced Easter Eggs

| # | Name | Trigger | Effect |
|---|---|---|---|
| 6 | **💀 Thanos Snap** | Type `thanos` | 50 % of DOM elements dissolve into particle dust |
| 7 | **🔫 GTA Wasted** | Type `wasted` | Screen desaturates, bullet-time slow-mo, red **WASTED** text |
| 8 | **🚔 GTA Wanted** | Type `wanted` | 5-star wanted level + police siren strobes. Type `leavemealone` to clear |
| 9 | **🟦 Windows BSOD** | Type `bsod` or `windows` | Full Blue Screen of Death overlay. Click to dismiss |
| 10 | **🤖 Iron Man Jarvis HUD** | Type `jarvis` | Holographic targeting HUD overlay *(toggle on/off)* |
| 11 | **🍎 Apple "One More Thing"** | Type `onemorething` | Dramatic Steve Jobs spotlight moment |
| 12 | **🥽 Apple Vision Pro** | Type `visionpro` | 3D isometric spatial UI tilt *(toggle on/off)* |
| 13 | **🌆 Cyberpunk Glitch** | Type `cyberpunk` | RGB chromatic aberration + screen tearing *(toggle on/off)* |
| 14 | **📐 Google Askew** | Type `askew` | Entire page tilts 3° *(toggle on/off)* |
| 15 | **👾 Google Zerg Rush** | Type `zergrush` | Red **O** circles fall and eat page content. Click to kill |

---

## 🛠️ Setup & Development

### Quick Start

```bash
# Clone the repository
git clone https://github.com/utkarshkr13/anti-gravity-portfolio.git
cd anti-gravity-portfolio

# Option A — just open in a browser
open index.html        # macOS
start index.html       # Windows

# Option B — local dev server
python -m http.server 8000
```

### Market Data Pipeline

```bash
pip install yfinance pandas
python scripts/fetch_market.py
```

> A **GitHub Action** runs every hour to automatically refresh `market.json` with the latest prices.

---

<p align="center"><b>⭐ Star this repo if you find the Easter eggs!</b></p>
