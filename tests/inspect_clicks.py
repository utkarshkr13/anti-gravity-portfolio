with open('tests/test_suite.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'client.click' in line:
        print(f"Line {idx+1}: {line.strip()}")
