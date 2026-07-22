import re
import sys

def inspect():
    sys.stdout.reconfigure(encoding='utf-8')
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the projects section
    projects_section_match = re.search(r'id="projects".*?</section>', html, re.DOTALL)
    if not projects_section_match:
        print("Could not find projects section by id='projects'")
        return
        
    projects_section = projects_section_match.group(0)
    
    # Find all project-card blocks
    # We can split by class="project-card or similar
    cards = re.findall(r'<div class="project-card[^"]*"[^>]*>.*?</div>\s*</div>\s*</div>', html, re.DOTALL)
    print(f"Total project cards found: {len(cards)}")
    
    for idx, card in enumerate(cards):
        title_match = re.search(r'<h3 class="project-card-title">(.*?)</h3>', card)
        title = title_match.group(1).strip() if title_match else "Unknown Title"
        
        cat_match = re.search(r'data-category="([^"]*)"', card)
        cat = cat_match.group(1).strip() if cat_match else "None"
        
        print(f"\n--- Card {idx+1}: {title} (Category: {cat}) ---")
        
        # Look for links inside this card
        links = re.findall(r'<a\s+([^>]+)>(.*?)</a>', card, re.DOTALL)
        for attrs, content in links:
            content_clean = re.sub(r'<[^>]+>', '', content).strip()
            attr_dict = dict(re.findall(r'(\w+)="([^"]*)"', attrs))
            relevant = {k: v for k, v in attr_dict.items() if k in ['class', 'data-project', 'href', 'id']}
            print(f"  Link: '{content_clean}' | Attributes: {relevant}")

if __name__ == "__main__":
    inspect()
