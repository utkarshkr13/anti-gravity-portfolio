import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# find all HTML elements containing "project-card" in their class
# using regex matching any tag that has class containing "project-card"
tags = re.findall(r'<[a-zA-Z0-9_-]+\s+[^>]*class="[^"]*project-card[^"]*"[^>]*>', html)
print(f"Found {len(tags)} tags with class containing 'project-card':")
for t in tags:
    print(" ", t)
