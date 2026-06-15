import urllib.request
import json
import os
import sys

USERNAME = "utkarshkr13"

def fetch_github_stats():
    stats = {
        "profile": {
            "username": USERNAME,
            "public_repos": 14,
            "followers": 12,
            "following": 15,
            "total_stars": 8
        },
        "languages": [
            {"name": "Python", "percentage": 48.5},
            {"name": "JavaScript", "percentage": 32.0},
            {"name": "HTML", "percentage": 10.5},
            {"name": "CSS", "percentage": 9.0}
        ],
        "pinned_repos": [
            {
                "name": "anti-gravity-portfolio",
                "description": "Premium dynamic developer portfolio with integrated smooth Lenis scroll, GSAP animations, yfinance ticker, and developer utilities.",
                "stars": 4,
                "language": "JavaScript",
                "url": "https://github.com/utkarshkr13/anti-gravity-portfolio"
            },
            {
                "name": "Side_Quest",
                "description": "Python, automation, and backend side quests exploring developer microservices and scrapers.",
                "stars": 2,
                "language": "Python",
                "url": "https://github.com/utkarshkr13/Side_Quest"
            },
            {
                "name": "fastapi-microservice-template",
                "description": "A robust, clean template for deploying microservices with FastAPI, Docker, and automatic OpenAPI docs.",
                "stars": 1,
                "language": "Python",
                "url": "https://github.com/utkarshkr13/fastapi-microservice-template"
            },
            {
                "name": "ai-ops-agent",
                "description": "An experimental agentic workflow automation framework built for system ops scripting.",
                "stars": 1,
                "language": "Python",
                "url": "https://github.com/utkarshkr13/ai-ops-agent"
            }
        ]
    }

    try:
        # Fetch profile
        profile_url = f"https://api.github.com/users/{USERNAME}"
        req = urllib.request.Request(profile_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            profile_data = json.loads(response.read().decode('utf-8'))
            stats["profile"]["public_repos"] = profile_data.get("public_repos", stats["profile"]["public_repos"])
            stats["profile"]["followers"] = profile_data.get("followers", stats["profile"]["followers"])
            stats["profile"]["following"] = profile_data.get("following", stats["profile"]["following"])

        # Fetch repos
        repos_url = f"https://api.github.com/users/{USERNAME}/repos?per_page=100"
        req = urllib.request.Request(repos_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            repos_data = json.loads(response.read().decode('utf-8'))
            
            total_stars = 0
            lang_bytes = {}
            repos_list = []
            
            for repo in repos_data:
                if repo.get("fork"):
                    continue
                stars = repo.get("stargazers_count", 0)
                total_stars += stars
                
                lang = repo.get("language")
                if lang:
                    lang_bytes[lang] = lang_bytes.get(lang, 0) + repo.get("size", 100) # Fallback to size as proxy for weight
                
                repos_list.append({
                    "name": repo.get("name"),
                    "description": repo.get("description") or "Developer project repository.",
                    "stars": stars,
                    "language": lang or "Other",
                    "url": repo.get("html_url")
                })
            
            stats["profile"]["total_stars"] = total_stars
            
            # Sort repos by stars
            repos_list.sort(key=lambda x: x["stars"], reverse=True)
            if repos_list:
                # Keep top 4 repositories for display
                stats["pinned_repos"] = repos_list[:4]
                
            # Process language percentages
            total_bytes = sum(lang_bytes.values())
            if total_bytes > 0:
                languages = []
                for name, b in lang_bytes.items():
                    pct = round((b / total_bytes) * 100, 1)
                    languages.append({"name": name, "percentage": pct})
                languages.sort(key=lambda x: x["percentage"], reverse=True)
                stats["languages"] = languages

        print("Successfully fetched live GitHub statistics.")
    except Exception as e:
        print(f"Error fetching GitHub stats: {e}. Using cache/fallback values.")

    return stats

def main():
    stats = fetch_github_stats()
    out_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'github_stats.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"Wrote stats to {out_path}")

if __name__ == "__main__":
    main()
