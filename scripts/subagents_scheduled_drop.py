import os
import subprocess
import sys

CWD = os.path.dirname(os.path.abspath(__file__))
PORTFOLIO_DIR = os.path.abspath(os.path.join(CWD, ".."))

def run_tests():
    print("Running integrated test runner before dropping changes...")
    test_runner_path = os.path.join(PORTFOLIO_DIR, "tests", "run_tests.py")
    result = subprocess.run([sys.executable, test_runner_path], capture_output=True, text=True, cwd=PORTFOLIO_DIR)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result.returncode == 0

def drop_changes():
    print("Starting scheduled code drop for sub-agents (UIE audit & layout polish teams)...")
    try:
        # Check git status for modified files
        res = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, cwd=PORTFOLIO_DIR)
        status_output = res.stdout.strip()
        if not status_output:
            print("No changes found to drop.")
            return

        # Stage modified files and new test infra files
        print("Staging changes...")
        # Add index.html, style.css, js files, tests files, project md files
        subprocess.run(["git", "add", "index.html", "css/style.css", "js/", "tests/", "PROJECT.md", "TEST_INFRA.md", "TEST_READY.md", ".gitignore"], cwd=PORTFOLIO_DIR, check=True)

        print("Committing changes...")
        commit_msg = "style: scheduled drop of layout polish and UI audit updates"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=PORTFOLIO_DIR, check=True)

        print("Pulling remote changes via rebase...")
        pull_res = subprocess.run(["git", "pull", "--rebase", "origin", "main"], capture_output=True, text=True, cwd=PORTFOLIO_DIR)
        if pull_res.returncode != 0:
            print("Rebase conflict detected. Attempting to resolve conflicts automatically...")
            # Checkout ours for assets, theirs for others, or abort if too complex
            # For a simple drop, we want to prioritize our layout/style changes
            subprocess.run(["git", "rebase", "--abort"], cwd=PORTFOLIO_DIR)
            print("Rebase aborted due to conflicts. Manual resolution needed.")
            return

        print("Pushing updates to GitHub main...")
        subprocess.run(["git", "push", "origin", "main"], cwd=PORTFOLIO_DIR, check=True)
        print("Successfully dropped changes to GitHub main!")
    except Exception as ex:
        print(f"Error during scheduled drop: {ex}")

def main():
    if run_tests():
        drop_changes()
    else:
        print("Tests failed! Scheduled drop aborted to prevent production breakages.")

if __name__ == "__main__":
    main()
