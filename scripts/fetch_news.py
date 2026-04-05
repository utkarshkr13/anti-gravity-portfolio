import urllib.request
import xml.etree.ElementTree as ET
import json
import os

FEEDS = [
    "https://techcrunch.com/feed/",
    "https://www.wired.com/feed/rss",
    "https://cointelegraph.com/rss",
    "https://hnrss.org/frontpage"
]

def fetch_feed(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            tree = ET.parse(response)
            root = tree.getroot()
            
            headlines = []
            for item in root.findall('.//item')[:15]: # Max 15 per feed
                title = item.find('title')
                if title is not None and title.text:
                    clean_title = title.text.strip()
                    if clean_title:
                        headlines.append(clean_title)
            return headlines
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

def main():
    all_news = []
    for feed in FEEDS:
        print(f"Parsing {feed}...")
        headlines = fetch_feed(feed)
        all_news.extend(headlines)
        
    # Remove duplicates and add some base/fallback data just in case
    all_news = list(set(all_news))
    if len(all_news) < 10:
        all_news.extend([
            "Bitcoin surges past market expectations",
            "Tech Giants announce new AI infrastructure investment",
            "Global IT spending set to increase heavily next quarter",
            "New zero-day vulnerabilities discovered in legacy servers",
            "Machine Learning optimization drastically reduces compute costs"
        ])
        
    # Shuffle slightly for visual variety
    data = {"headlines": all_news}
    
    # Write to assets
    out_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'news.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully wrote {len(all_news)} headlines to assets/news.json")

if __name__ == "__main__":
    main()
