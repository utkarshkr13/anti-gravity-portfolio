import unittest
from unittest.mock import patch, MagicMock
import urllib.request
import json
import os
import sys
import pandas as pd

# Add the project root to sys.path so we can import scripts
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import the modules under test
from scripts import fetch_market
from scripts import update_github_stats
from scripts import portfolio_auto_upgrade

class TestSyncScripts(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # We will keep backups of the existing JSON files if they exist, to restore them after testing
        cls.assets_dir = os.path.join(project_root, "assets")
        cls.backup_files = {}
        for filename in ["market.json", "github_stats.json", "feature_inspiration.json"]:
            path = os.path.join(cls.assets_dir, filename)
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    cls.backup_files[filename] = f.read()

    @classmethod
    def tearDownClass(cls):
        # Restore the original JSON files to avoid dirtying git state
        for filename, content in cls.backup_files.items():
            path = os.path.join(cls.assets_dir, filename)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

    @patch("yfinance.download")
    def test_fetch_market_success(self, mock_yf_download):
        """Test fetch_market.py writes a valid JSON structure with mocked yfinance download."""
        # Setup mock DataFrame for batch download of SYMBOLS
        symbols = fetch_market.SYMBOLS
        columns = pd.MultiIndex.from_product([symbols, ['Open', 'Close']])
        
        # We simulate a weekend/crypto gap by having valid open/close values for all symbols
        row_data = []
        for symbol in symbols:
            # Alternate positive and negative price movements for testing variety
            if symbol.startswith("A"):
                row_data.extend([100.0, 105.0]) # Positive
            else:
                row_data.extend([100.0, 95.0])  # Negative
                
        mock_df = pd.DataFrame([row_data], columns=columns)
        mock_yf_download.return_value = mock_df

        # Run fetch_market main (will write to assets/market.json)
        fetch_market.main()
        
        # Verify assets/market.json content
        market_json_path = os.path.join(self.assets_dir, "market.json")
        self.assertTrue(os.path.exists(market_json_path))
        
        with open(market_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        self.assertIn("tickers", data)
        tickers = data["tickers"]
        self.assertGreater(len(tickers), 0)
        
        # Validate schema for the first ticker
        ticker = tickers[0]
        self.assertIn("symbol", ticker)
        self.assertIn("price", ticker)
        self.assertIn("change", ticker)
        self.assertIn("is_positive", ticker)
        self.assertIsInstance(ticker["is_positive"], bool)
        self.assertIsInstance(ticker["price"], (int, float))

    @patch("urllib.request.urlopen")
    def test_update_github_stats_success(self, mock_urlopen):
        """Test update_github_stats.py writes a valid JSON structure with mocked GitHub API."""
        
        # Mock responses for GitHub profile and repos
        mock_profile_data = {
            "public_repos": 987,
            "followers": 1234,
            "following": 56
        }
        
        mock_repos_data = [
            {
                "fork": False,
                "stargazers_count": 120,
                "language": "Python",
                "size": 500,
                "name": "mock-repo-1",
                "html_url": "https://github.com/utkarshkr13/mock-repo-1",
                "description": "Mock repository one description"
            },
            {
                "fork": False,
                "stargazers_count": 80,
                "language": "JavaScript",
                "size": 300,
                "name": "mock-repo-2",
                "html_url": "https://github.com/utkarshkr13/mock-repo-2",
                "description": "Mock repository two description"
            }
        ]
        
        def urlopen_side_effect(req, *args, **kwargs):
            url = req.full_url if hasattr(req, "full_url") else req
            mock_resp = MagicMock()
            if "repos" in url:
                mock_resp.read.return_value = json.dumps(mock_repos_data).encode("utf-8")
            else:
                mock_resp.read.return_value = json.dumps(mock_profile_data).encode("utf-8")
            mock_resp.__enter__.return_value = mock_resp
            return mock_resp
            
        mock_urlopen.side_effect = urlopen_side_effect

        # Run update_github_stats main (writes to assets/github_stats.json)
        update_github_stats.main()
        
        # Verify assets/github_stats.json content
        github_json_path = os.path.join(self.assets_dir, "github_stats.json")
        self.assertTrue(os.path.exists(github_json_path))
        
        with open(github_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        self.assertIn("profile", data)
        self.assertIn("languages", data)
        self.assertIn("pinned_repos", data)
        
        # Check custom mocked numbers
        self.assertEqual(data["profile"]["public_repos"], 987)
        self.assertEqual(data["profile"]["followers"], 1234)
        self.assertEqual(data["profile"]["total_stars"], 200) # 120 + 80
        
        # Check language breakdown
        languages = data["languages"]
        self.assertEqual(len(languages), 2)
        # Size weights: Python (500 / 800) = 62.5%, JS (300 / 800) = 37.5%
        self.assertEqual(languages[0]["name"], "Python")
        self.assertEqual(languages[0]["percentage"], 62.5)

    @patch("urllib.request.urlopen")
    @patch("scripts.portfolio_auto_upgrade.deploy_to_production")
    @patch("scripts.portfolio_auto_upgrade.run_script")
    def test_portfolio_auto_upgrade_inspiration_and_sanity(self, mock_run_script, mock_deploy, mock_urlopen):
        """Test portfolio_auto_upgrade.py fetches inspiration, passes sanity checks, and skips real deploy."""
        
        # Mock GitHub search API response
        mock_search_data = {
            "items": [
                {
                    "owner": {"login": "mock-inspiration-owner"},
                    "name": "mock-inspiration-repo",
                    "stargazers_count": 9999,
                    "html_url": "https://github.com/mock-inspiration-owner/mock-inspiration-repo",
                    "homepage": "https://mock.inspiration.com",
                    "description": "Awesome minimalist design concept portfolio website",
                    "topics": ["minimalist", "clean"]
                }
            ]
        }
        
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps(mock_search_data).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp
        
        # Mock run_script to just call main functions in-process to ensure our mocks apply
        def side_effect_run_script(path):
            if "fetch_market.py" in path:
                # Mock yfinance for fetch_market run
                with patch("yfinance.download") as mock_yf:
                    symbols = fetch_market.SYMBOLS
                    columns = pd.MultiIndex.from_product([symbols, ['Open', 'Close']])
                    row_data = [100.0, 105.0] * len(symbols)
                    mock_yf.return_value = pd.DataFrame([row_data], columns=columns)
                    fetch_market.main()
                return True
            elif "update_github_stats.py" in path:
                # Mock urlopen for update_github_stats run
                mock_profile = {"public_repos": 987, "followers": 1234, "following": 56}
                mock_repos = [{"fork": False, "stargazers_count": 120, "language": "Python", "size": 500, "name": "mock-repo-1", "html_url": "url", "description": "desc"}]
                def inner_urlopen(req, *args, **kwargs):
                    url = req.full_url if hasattr(req, "full_url") else req
                    r = MagicMock()
                    r.read.return_value = json.dumps(mock_repos if "repos" in url else mock_profile).encode("utf-8")
                    r.__enter__.return_value = r
                    return r
                with patch("urllib.request.urlopen", side_effect=inner_urlopen):
                    update_github_stats.main()
                return True
            return False
            
        mock_run_script.side_effect = side_effect_run_script

        # Run auto upgrade script main
        portfolio_auto_upgrade.main()
        
        # Verify that assets/feature_inspiration.json was created/updated correctly
        inspiration_path = os.path.join(self.assets_dir, "feature_inspiration.json")
        self.assertTrue(os.path.exists(inspiration_path))
        
        with open(inspiration_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        self.assertEqual(data["repo_name"], "mock-inspiration-owner/mock-inspiration-repo")
        self.assertEqual(data["stars"], 9999)
        self.assertEqual(data["effect_class"], "minimal") # "minimalist" in description/topics maps to "minimal"
        self.assertIn("accent_h", data)
        self.assertIn("theme_name", data)
        
        # Verify sanity checks passed (since deploy_to_production should have been called)
        mock_deploy.assert_called_once()
        
    def test_sanity_checks_fail_on_missing_files(self):
        """Verify sanity checks detect missing or invalid project components."""
        # Backup index.html path
        html_path = os.path.join(project_root, "index.html")
        temp_html_path = os.path.join(project_root, "index_backup.html")
        
        # Temporarily rename index.html to simulate missing file
        if os.path.exists(html_path):
            os.rename(html_path, temp_html_path)
            
        try:
            passed = portfolio_auto_upgrade.perform_sanity_checks()
            self.assertFalse(passed)
        finally:
            # Restore index.html
            if os.path.exists(temp_html_path):
                os.rename(temp_html_path, html_path)

if __name__ == "__main__":
    unittest.main()
