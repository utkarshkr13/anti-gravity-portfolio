import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "css" / "style.css").read_text(encoding="utf-8")
JS = (ROOT / "js" / "main.js").read_text(encoding="utf-8")
PROFILE = (ROOT / "data" / "PROFILE.yaml").read_text(encoding="utf-8")


class PortfolioContentTests(unittest.TestCase):
    def test_positioning_and_employment_facts(self):
        combined = f"{HTML}\n{PROFILE}"
        self.assertIn("Business Analyst", combined)
        self.assertIn("Product Analyst", combined)
        self.assertRegex(combined, r"Apr(?:il)? 2025")
        self.assertRegex(combined, r"Jul(?:y)? 2026")
        self.assertIn("40%", combined)
        self.assertIn("30%", combined)

    def test_featured_projects_are_present(self):
        self.assertIn("SAP Integration Testing Tracker", HTML)
        self.assertIn("L2 Client Escalation Portal", HTML)

    def test_primary_navigation_is_focused(self):
        for href in ("#work", "#about", "#contact"):
            self.assertIn(f'href="{href}"', HTML)

    def test_sections_follow_approved_order(self):
        section_ids = ["hero", "work", "experience", "about", "credentials", "contact"]
        positions = [HTML.index(f'id="{section_id}"') for section_id in section_ids]
        self.assertEqual(positions, sorted(positions))

    def test_stale_or_unsupported_claims_are_removed(self):
        production = f"{HTML}\n{CSS}\n{JS}\n{PROFILE}"
        rejected = (
            "Senior PM",
            "South Africa",
            "CCBCSA",
            "40+ daily",
            "15 hours/week",
            "cursor-dot",
            "sessionTimer",
            "linkedin_qr",
            "<form",
            "transition: all",
        )
        for value in rejected:
            self.assertNotIn(value, production, value)

    def test_images_declare_dimensions(self):
        images = re.findall(r"<img\b[^>]*>", HTML, flags=re.IGNORECASE)
        self.assertGreaterEqual(len(images), 3)
        for image in images:
            self.assertRegex(image, r'\bwidth="\d+"')
            self.assertRegex(image, r'\bheight="\d+"')
            self.assertRegex(image, r'\balt="[^"]*"')

    def test_accessibility_and_progressive_enhancement_contract(self):
        self.assertIn('class="skip-link"', HTML)
        self.assertIn('aria-expanded="false"', HTML)
        self.assertIn("prefers-reduced-motion: reduce", CSS)
        self.assertIn("focus-visible", CSS)
        self.assertIn("touch-action: manipulation", CSS)
        self.assertIn("IntersectionObserver", JS)
        self.assertIn("prefers-reduced-motion: reduce", JS)
        self.assertIn("aria-expanded", JS)
        self.assertIn('event.key === "Escape"', JS)
        self.assertNotIn("pointermove", JS)
        self.assertNotIn("requestAnimationFrame", JS)


if __name__ == "__main__":
    unittest.main()
