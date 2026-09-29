import asyncio


async def run_redesign_checks(client):
    checks = []

    async def check(name, expression):
        result = await client.eval_js(expression)
        passed = bool(result)
        checks.append((name, passed, result))
        print(f"  [{'PASS' if passed else 'FAIL'}] {name}: {result}")

    await check(
        "approved section order",
        "JSON.stringify([...document.querySelectorAll('main > section')].map((section) => section.id)) === "
        "JSON.stringify(['hero','work','experience','about','credentials','contact'])",
    )
    await check("single page heading", "document.querySelectorAll('h1').length === 1")
    await client.eval_js("document.querySelector('#contact').scrollIntoView({block: 'end'})")
    await asyncio.sleep(0.5)
    await client.eval_js("window.scrollTo(0, 0)")
    await asyncio.sleep(0.25)
    await check("all images loaded", "[...document.images].every((image) => image.complete && image.naturalWidth > 0)")
    await check(
        "desktop has no horizontal overflow",
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
    )
    await check(
        "featured screenshots are readable",
        "[...document.querySelectorAll('.case-media img')].every((image) => image.getBoundingClientRect().width >= 430)",
    )
    await check(
        "primary actions use links",
        "document.querySelectorAll('.hero-actions a, .case-links a, .contact-links a').length >= 8",
    )

    await client.set_viewport(390, 844)
    await asyncio.sleep(0.25)
    await client.eval_js("document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0)")
    await asyncio.sleep(0.4)
    await client.take_screenshot("tests/screenshots/mobile_view.png")
    await check(
        "mobile has no horizontal overflow",
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
    )
    await client.click(".nav-toggle")
    await check(
        "mobile navigation opens",
        "document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'true' && "
        "document.querySelector('.site-nav').classList.contains('is-open')",
    )
    await client.eval_js("document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))")
    await check(
        "Escape closes mobile navigation",
        "document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'false'",
    )
    await check(
        "mobile controls meet minimum target",
        "[...document.querySelectorAll('.nav-toggle, .button')].every((item) => item.getBoundingClientRect().height >= 44)",
    )

    return all(passed for _, passed, _ in checks)
