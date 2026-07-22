with open('tests/test_suite.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'set_viewport' in line or '375' in line or '812' in line or '1280' in line:
        print(f"Line {idx+1}: {line.strip()}")
