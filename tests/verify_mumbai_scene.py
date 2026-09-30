"""Browser regression checks for the Mumbai scene; run against the local test server."""
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8766/"
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    page = browser.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(URL, wait_until="networkidle")
    page.locator("#pageLoader").wait_for(state="hidden")
    assert page.locator(".scene-ready").count() == 1, "WebGL scene did not initialize"
    for width in [320, 375, 640, 641, 710, 768, 820, 821, 1280]:
        page.set_viewport_size({"width": width, "height": 900})
        assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"), width
        assert page.locator("#themeToggle").is_visible(), width
        assert page.locator(".section-title .char-span").count() == 0
    page.locator("#sceneMotionToggle").click()
    assert page.locator("#sceneMotionToggle").get_attribute("aria-pressed") == "true"
    page.locator("#sceneMotionToggle").click()
    assert page.locator("#sceneMotionToggle").get_attribute("aria-pressed") == "false"
    page.emulate_media(reduced_motion="reduce")
    assert not page.locator("#sceneMotionToggle").is_visible()
    page.emulate_media(reduced_motion="no-preference")
    page.get_by_role("button", name="Toggle dark/light mode").click()
    page.wait_for_function("document.documentElement.dataset.theme === 'light'")
    assert not errors, errors
    fallback = browser.new_page()
    fallback.add_init_script("""const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          return type === 'webgl' ? null : get.call(this, type, ...args);
        };""")
    fallback.goto(URL, wait_until="networkidle")
    assert fallback.locator(".scene-ready").count() == 0
    assert fallback.locator("#mumbaiSceneImage").evaluate("image => image.complete && image.naturalWidth > 0")
    assert fallback.locator(".hero-subtitle").is_visible()
    page.set_viewport_size({"width": 1280, "height": 900})
    page.locator("#themeToggle").click()
    page.wait_for_function("document.documentElement.dataset.theme === 'dark'")
    page.screenshot(path="tests/screenshots/mumbai-desktop.png")
    browser.close()
print("PASS: 9 responsive widths, WebGL initialization, reduced motion, pause/resume, theme switching and image fallback")
