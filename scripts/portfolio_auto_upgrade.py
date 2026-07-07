import os
import subprocess
import sys
import json
import random
import urllib.request
import hashlib
import time

CWD = os.path.dirname(os.path.abspath(__file__))
PORTFOLIO_DIR = os.path.abspath(os.path.join(CWD, ".."))

def run_script(path):
    print(f"Running script: {path}")
    result = subprocess.run([sys.executable, path], capture_output=True, text=True, cwd=PORTFOLIO_DIR)
    if result.returncode != 0:
        print(f"Error executing {path}: {result.stderr}")
        return False
    print(result.stdout)
    return True

def fetch_portfolio_inspiration():
    print("Fetching top developer portfolios from GitHub Search API...")
    
    # Curated backup list of top developer portfolios in case of API rate limiting or offline status
    fallbacks = [
        {"owner": "soumyajit4419", "name": "Portfolio", "stars": 6400, "url": "https://github.com/soumyajit4419/Portfolio", "homepage": "https://soumyajit.tech", "description": "A clean React developer portfolio template.", "topics": ["react", "portfolio", "javascript"]},
        {"owner": "Evavic44", "name": "portfolio-ideas", "stars": 6200, "url": "https://github.com/Evavic44/portfolio-ideas", "homepage": "https://portfolio-ideas.tech", "description": "Curated list of awesome portfolio concepts.", "topics": ["design", "inspiration", "ideas"]},
        {"owner": "ashutosh1919", "name": "masterPortfolio", "stars": 4200, "url": "https://github.com/ashutosh1919/masterPortfolio", "homepage": "https://master-portfolio.tech", "description": "Full React developer portfolio template.", "topics": ["react", "javascript", "portfolio"]},
        {"owner": "saadpasta", "name": "developer-portfolio", "stars": 3800, "url": "https://github.com/saadpasta/developer-portfolio", "homepage": "https://saadpasta.tech", "description": "A software developer portfolio template built with React.", "topics": ["react", "tailwind", "portfolio"]},
        {"owner": "bchiang7", "name": "v4", "stars": 8200, "url": "https://github.com/bchiang7/v4", "homepage": "https://brittanychiang.com", "description": "A personal website built with Gatsby and styled-components.", "topics": ["gatsby", "react", "styled-components"]},
        {"owner": "timqian", "name": "portfolio", "stars": 1200, "url": "https://github.com/timqian/portfolio", "homepage": "https://timqian.com", "description": "Super minimal flat developer page.", "topics": ["minimalist", "clean", "html"]},
        {"owner": "yairm210", "name": "portfolio", "stars": 950, "url": "https://github.com/yairm210/portfolio", "homepage": "https://yairm.dev", "description": "Interactive retro console portfolio site.", "topics": ["terminal", "retro", "interactive"]},
        {"owner": "lucagez", "name": "terminal", "stars": 2300, "url": "https://github.com/lucagez/terminal", "homepage": "https://lucagez.dev", "description": "Terminal-style developer portfolio website.", "topics": ["terminal", "react", "cli"]}
    ]

    selected = None
    try:
        # Search GitHub for developer-portfolios with over 500 stars
        url = "https://api.github.com/search/repositories?q=topic:portfolio+stars:%3E500&sort=stars&order=desc&per_page=30"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode('utf-8'))
            items = data.get("items", [])
            if items:
                repo = random.choice(items)
                selected = {
                    "owner": repo["owner"]["login"],
                    "name": repo["name"],
                    "stars": repo["stargazers_count"],
                    "url": repo["html_url"],
                    "homepage": repo.get("homepage") or "",
                    "description": repo.get("description") or "Outstanding developer portfolio repository.",
                    "topics": repo.get("topics", [])
                }
                print(f"Successfully fetched portfolio from API: {selected['owner']}/{selected['name']}")
    except Exception as e:
        print(f"GitHub API access error: {e}. Using cached curated portfolio fallback.")

    if not selected:
        selected = random.choice(fallbacks)
        print(f"Selected fallback portfolio: {selected['owner']}/{selected['name']}")

    # Map topics and description keywords to feature highlights
    topics = [t.lower() for t in selected["topics"]]
    desc = selected["description"].lower()

    if any(x in topics or x in desc for x in ["three", "threejs", "3d", "webgl", "canvas", "three.js"]):
        trend = "Interactive 3D graphics and immersive canvas experience utilizing Three.js and WebGL shaders."
        effect = "three3d"
    elif any(x in topics or x in desc for x in ["animation", "framer", "motion", "gsap", "anime"]):
        trend = "Fluid micro-interactions and scroll-bound animations utilizing GSAP or Framer Motion."
        effect = "animations"
    elif any(x in topics or x in desc for x in ["tailwind", "tailwindcss"]):
        trend = "Utility-first responsive layout and streamlined modern design components using Tailwind CSS."
        effect = "tailwind"
    elif any(x in topics or x in desc for x in ["typescript", "ts"]):
        trend = "Type-safe client architecture and modular component design pattern using TypeScript."
        effect = "typescript"
    elif any(x in topics or x in desc for x in ["terminal", "cli", "command", "shell"]):
        trend = "Retro-modern CLI (Command Line Interface) style navigation and interactive terminal layout."
        effect = "terminal"
    elif any(x in topics or x in desc for x in ["minimalist", "minimal", "clean"]):
        trend = "Elegant minimalist aesthetic focused on typography, breathing space, and high readability."
        effect = "minimal"
    elif any(x in topics or x in desc for x in ["react", "nextjs", "next", "vue"]):
        trend = "Server-side rendered performance and fast client-side hydration using Next.js framework."
        effect = "reactive"
    else:
        if selected["topics"]:
            tags_str = ", ".join(selected["topics"][:3])
            trend = f"Modern modular layout with responsive grids emphasizing {tags_str} workflows."
        else:
            trend = selected["description"]
        effect = "generic"

    # Compute a beautiful, stable HSL color accent by hashing the repo full name, constrained to the Sage Green family
    fullname = f"{selected['owner']}/{selected['name']}"
    hash_val = int(hashlib.md5(fullname.encode('utf-8')).hexdigest(), 16)
    hue = 115 + (hash_val % 21)       # Sage Green family hue range: 115 (Muted Olive) to 135 (Muted Mint)
    saturation = 14 + (hash_val % 9)  # 14% to 22% (subtle muted saturation)
    lightness = 42 + (hash_val % 7)   # 42% to 48% (fits #618764 design spec)

    color_names = {
        115: "Muted Olive",
        120: "Sage Green",
        125: "Forest Sage",
        130: "Earthy Green",
        135: "Muted Mint"
    }
    closest_hue = min(color_names.keys(), key=lambda k: min(abs(hue - k), 360 - abs(hue - k)))
    theme_name = color_names[closest_hue]

    # Format timestamp
    sync_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())

    payload = {
        "repo_name": fullname,
        "owner": selected["owner"],
        "stars": selected["stars"],
        "url": selected["url"],
        "homepage": selected["homepage"],
        "featured_trend": trend,
        "effect_class": effect,
        "accent_h": hue,
        "accent_s": f"{saturation}%",
        "accent_l": f"{lightness}%",
        "theme_name": theme_name,
        "last_sync": sync_time
    }
    
    inspiration_path = os.path.join(PORTFOLIO_DIR, "assets", "feature_inspiration.json")
    os.makedirs(os.path.dirname(inspiration_path), exist_ok=True)
    with open(inspiration_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(f"Successfully spotlighted {fullname} and generated design inspiration theme payload.")

def perform_sanity_checks():
    print("Running portfolio sanity check tests...")
    
    # 1. Verify index.html exists and is not empty
    html_path = os.path.join(PORTFOLIO_DIR, "index.html")
    if not os.path.exists(html_path) or os.path.getsize(html_path) == 0:
        print("Sanity Check Fail: index.html is missing or empty!")
        return False
        
    # Read HTML content to verify elements presence/absence
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    # Assert new features exist
    if "projectModal" not in html_content:
        print("Sanity Check Fail: projectModal is missing from index.html!")
        return False
    if "projects-filter-bar" not in html_content:
        print("Sanity Check Fail: projects-filter-bar is missing from index.html!")
        return False
        
    # Assert old widgets are removed
    if "aiWidget" in html_content or "ai-copilot-widget" in html_content:
        print("Sanity Check Fail: aiWidget/ai-copilot-widget was found in index.html but should be removed!")
        return False
    if "easterEggsPanel" in html_content or "easter-eggs-panel" in html_content:
        print("Sanity Check Fail: easterEggsPanel/easter-eggs-panel was found in index.html but should be removed!")
        return False
        
    # 2. Verify css/style.css exists
    css_path = os.path.join(PORTFOLIO_DIR, "css", "style.css")
    if not os.path.exists(css_path) or os.path.getsize(css_path) == 0:
        print("Sanity Check Fail: css/style.css is missing or empty!")
        return False
        
    # 3. Check JSON assets are valid
    for asset in ["market.json", "github_stats.json", "feature_inspiration.json"]:
        path = os.path.join(PORTFOLIO_DIR, "assets", asset)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    json.load(f)
            except Exception as ex:
                print(f"Sanity Check Fail: assets/{asset} is not valid JSON! {ex}")
                return False
                
    print("Sanity Check Passed.")
    return True

def deploy_to_production():
    print("Deploying updates to remote repository...")
    try:
        # Check status
        res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, cwd=PORTFOLIO_DIR)
        if not res.stdout.strip():
            print("No changes to deploy.")
            return
            
        print("Staging modified assets...")
        subprocess.run(["git", "add", "assets/market.json", "assets/github_stats.json", "assets/feature_inspiration.json"], cwd=PORTFOLIO_DIR, check=True)
        
        print("Committing updates...")
        commit_msg = "cron: automated github stats, market data, and design inspiration updates"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=PORTFOLIO_DIR, check=True)
        
        # Pull and rebase with auto conflict resolution for JSON files
        print("Pulling remote changes via rebase...")
        pull_res = subprocess.run(["git", "pull", "--rebase", "origin", "main"], capture_output=True, text=True, cwd=PORTFOLIO_DIR)
        if pull_res.returncode != 0:
            print("Rebase conflict/error detected. Resolving conflict on generated JSON assets automatically...")
            # Overwrite conflict on generated json assets using our local fresh generated copies
            subprocess.run(["git", "checkout", "--ours", "assets/market.json", "assets/github_stats.json", "assets/feature_inspiration.json"], cwd=PORTFOLIO_DIR)
            subprocess.run(["git", "add", "assets/market.json", "assets/github_stats.json", "assets/feature_inspiration.json"], cwd=PORTFOLIO_DIR)
            
            # Continue the rebase
            rebase_cont = subprocess.run(["git", "-c", "core.editor=true", "rebase", "--continue"], capture_output=True, text=True, cwd=PORTFOLIO_DIR)
            if rebase_cont.returncode != 0:
                print(f"Rebase continue failed: {rebase_cont.stderr}. Aborting rebase.")
                subprocess.run(["git", "rebase", "--abort"], cwd=PORTFOLIO_DIR)
                return
                
        print("Pushing updates to GitHub main...")
        subprocess.run(["git", "push", "origin", "main"], cwd=PORTFOLIO_DIR, check=True)
        print("Successfully deployed changes to remote GitHub.")
    except Exception as ex:
        print(f"Error during production deploy: {ex}")

def main():
    print("--- Starting Automated Portfolio Sync Core ---")
    
    # 1. Fetch live market prices
    run_script(os.path.join(PORTFOLIO_DIR, "scripts", "fetch_market.py"))
    
    # 2. Fetch live GitHub statistics
    run_script(os.path.join(PORTFOLIO_DIR, "scripts", "update_github_stats.py"))
    
    # 3. Fetch portfolio design trend/inspiration from top repositories
    fetch_portfolio_inspiration()
    
    # 4. Sanity checks
    if perform_sanity_checks():
        # 5. Push verified updates to production
        deploy_to_production()
    else:
        print("Sanity check failed. Deploy aborted.")

if __name__ == "__main__":
    main()
