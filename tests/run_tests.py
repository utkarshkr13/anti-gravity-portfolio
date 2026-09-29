import asyncio
import os
import subprocess
import sys

from cdp_client import CDPClient
from server import start_server, stop_server
from test_redesign_browser import run_redesign_checks


def run_unit_tests():
    print("\n--- Running Unit and Content Tests ---")
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "unittest",
            "tests.test_sync_scripts",
            "tests.test_portfolio_content",
            "-v",
        ],
        cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        text=True,
    )
    return result.returncode == 0


async def run_tests():
    print("=" * 70)
    print("PORTFOLIO REDESIGN VERIFICATION")
    print("=" * 70)
    success = run_unit_tests()
    server = None
    client = None

    try:
        server = start_server(8000)
        client = CDPClient(port=9225)
        await client.start()
        await client.set_viewport(1440, 1000)
        await client.navigate("http://localhost:8000/index.html")
        await asyncio.sleep(0.5)
        await client.take_screenshot("tests/screenshots/desktop_view.png")
        print("\n--- Running Desktop and Mobile Browser Checks ---")
        success = await run_redesign_checks(client) and success
    except Exception as error:
        print(f"[FAIL] Browser verification error: {error}")
        success = False
    finally:
        if client:
            await client.close()
        if server:
            stop_server(server)

    print("\n" + "=" * 70)
    print("ALL TESTS PASSED" if success else "TESTS FAILED")
    print("=" * 70)
    raise SystemExit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(run_tests())
