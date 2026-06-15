import os
import subprocess
import sys
import json
import random

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
    # Curated portfolio features and trends
    trends = [
        "Interactive Dark Mode/Light Mode toggles using CSS variables and smooth transition layers.",
        "Smooth inertial scrolling via Lenis paired with timeline scrubbing controls from GSAP.",
        "Floating active glowing cards utilizing CSS variables bound to pointer movement.",
        "Dynamic yfinance real-time stock and cryptocurrency pricing scrolling marquee.",
        "Interactive GitHub Contribution and repository metrics pulled live from REST endpoints.",
        "Mac-OS style window headers with functional controls in UI layouts.",
        "Custom cursor rings following cursor coordinates with elastic spring dynamics.",
        "Magnetic hover triggers on interactive links using physical translation vectors.",
        "Vibrant mesh gradients utilizing multi-stop radial backgrounds."
    ]
    selected = random.choice(trends)
    print(f"Trending Portfolio Feature Highlighted: {selected}")
    
    inspiration_path = os.path.join(PORTFOLIO_DIR, "assets", "feature_inspiration.json")
    os.makedirs(os.path.dirname(inspiration_path), exist_ok=True)
    with open(inspiration_path, "w", encoding="utf-8") as f:
        json.dump({"featured_trend": selected}, f, indent=2)

def perform_sanity_checks():
    print("Running portfolio sanity check tests...")
    
    # 1. Verify index.html exists and is not empty
    html_path = os.path.join(PORTFOLIO_DIR, "index.html")
    if not os.path.exists(html_path) or os.path.getsize(html_path) == 0:
        print("Sanity Check Fail: index.html is missing or empty!")
        return False
        
    # 2. Verify css/style.css exists
    css_path = os.path.join(PORTFOLIO_DIR, "css", "style.css")
    if not os.path.exists(css_path) or os.path.getsize(css_path) == 0:
        print("Sanity Check Fail: css/style.css is missing or empty!")
        return False
        
    # 3. Check JSON assets are valid
    for asset in ["market.json", "github_stats.json"]:
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
            
        print("Staging files...")
        subprocess.run(["git", "add", "assets/market.json", "assets/github_stats.json", "assets/feature_inspiration.json"], cwd=PORTFOLIO_DIR, check=True)
        
        print("Committing updates...")
        commit_msg = "cron: automated github stats, market data, and design inspiration updates"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=PORTFOLIO_DIR, check=True)
        
        print("Pushing to remote GitHub...")
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
    
    # 3. Fetch portfolio design trend/inspiration
    fetch_portfolio_inspiration()
    
    # 4. Sanity checks
    if perform_sanity_checks():
        # 5. Push verified updates to production
        deploy_to_production()
    else:
        print("Sanity check failed. Deploy aborted.")

if __name__ == "__main__":
    main()
