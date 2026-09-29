import asyncio
import os
import sys
import subprocess
from server import start_server, stop_server
from cdp_client import CDPClient
from test_suite import run_e2e_tests

async def run_tests():
    success = True
    print("======================================================================")
    print("                      STARTING INTEGRATED TEST RUNNER                 ")
    print("======================================================================")

    # 1. Run Sync Scripts Integration Tests first
    print("\n--- Running Sync Scripts Integration Tests (tests/test_sync_scripts.py) ---")
    sync_tests_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_sync_scripts.py")
    
    # Run unittest as a subprocess
    result = subprocess.run(
        [sys.executable, "-m", "unittest", sync_tests_path],
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
        
    if result.returncode == 0:
        print("[PASSED] Sync scripts integration tests passed successfully.")
    else:
        print("[FAILED] Sync scripts integration tests failed.")
        success = False

    # 2. Launch HTTP Test Server
    server = None
    try:
        server = start_server(8000)
    except Exception as e:
        print(f"[TEST RUNNER ERROR] Failed to start HTTP server on port 8000: {e}")
        sys.exit(1)

    client = None
    try:
        # 3. Start CDP Client
        client = CDPClient(port=9225)
        await client.start()
        
        # 4. Navigate to the page
        await client.navigate("http://localhost:8000/index.html")
        
        # Wait for the loader to be dismissed
        print("[TEST RUNNER] Waiting for page loader to dismiss...")
        for i in range(80):  # Wait up to 8 seconds
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                print(f"[TEST RUNNER] Page loader dismissed after {i * 0.1:.1f}s.")
                break
            await asyncio.sleep(0.1)
        else:
            print("[TEST RUNNER] Warning: Page loader did not dismiss within timeout, attempting to force hide it.")
            await client.eval_js("if(document.getElementById('pageLoader')) document.getElementById('pageLoader').style.display = 'none';")
        
        # Give the page a short moment to settle layout
        await asyncio.sleep(0.5)
        
        # 5. Run the frontend test suite E2E tests
        e2e_success = await run_e2e_tests(client)
        if e2e_success:
            print("[PASSED] Frontend E2E test suite completed successfully.")
        else:
            print("[FAILED] Frontend E2E test suite failed.")
            success = False

        # 5.5 Regression test for featured project card image height/aspect ratio on mobile
        print("\n--- Running Mobile Featured Project Card Image Regression Test ---")
        try:
            # Set viewport to mobile
            print("[TEST RUNNER] Resizing viewport to 375x812 for mobile aspect ratio check...")
            await client.set_viewport(375, 812)
            await asyncio.sleep(0.5)

            # Reset filter to 'all' to ensure all cards are visible
            print("[TEST RUNNER] Resetting filter to 'all' to ensure all cards are visible...")
            await client.click(".filter-btn[data-filter='all']")
            await asyncio.sleep(0.5)

            # Query the aspect ratio / min-height on mobile
            regression_info = await client.eval_js("""
                (function() {
                    const cards = Array.from(document.querySelectorAll('.project-card.featured'));
                    return cards.map(card => {
                        const img = card.querySelector('.project-card-image');
                        if (!img) return null;
                        const rect = img.getBoundingClientRect();
                        const computed = window.getComputedStyle(img);
                        return {
                            width: rect.width,
                            height: rect.height,
                            minHeight: computed.minHeight,
                            aspectRatio: computed.aspectRatio
                        };
                    }).filter(Boolean);
                })()
            """)

            regression_passed = True
            if not regression_info:
                print("[FAILED] No featured project cards or images found on the page.")
                regression_passed = False
            else:
                for idx, info in enumerate(regression_info):
                    width = info['width']
                    height = info['height']
                    min_height = info['minHeight']
                    aspect_ratio = info['aspectRatio']
                    
                    actual_ratio = width / height if height > 0 else 0
                    print(f"  Featured Card {idx} image container: {width:.2f}px x {height:.2f}px")
                    print(f"    Computed min-height: '{min_height}', aspect-ratio CSS: '{aspect_ratio}'")
                    print(f"    Physical Aspect Ratio: {actual_ratio:.4f}")
                    
                    # Verify min-height is auto or physical ratio is ~1.6
                    if min_height == "auto" or (1.5 <= actual_ratio <= 1.7):
                        print(f"    [PASS] Card {idx} meets responsive layout requirement.")
                    else:
                        print(f"    [FAILED] Card {idx} image container is stretched (ratio: {actual_ratio:.4f}, min-height: {min_height}).")
                        regression_passed = False

            # Restore viewport to desktop
            print("[TEST RUNNER] Restoring viewport to 1280x800...")
            await client.set_viewport(1280, 800)
            await asyncio.sleep(0.2)

            if not regression_passed:
                success = False

        except Exception as e:
            print(f"[TEST RUNNER ERROR] Exception checking mobile aspect ratio: {e}")
            success = False


    except Exception as e:
        print(f"\n[TEST RUNNER ERROR] Exception occurred during E2E tests: {e}")
        import traceback
        traceback.print_exc()
        success = False
        
    finally:
        # 6. Cleanup
        print("\n--- Cleaning Up ---")
        if client:
            try:
                await client.close()
            except Exception as e:
                print(f"Error closing CDP client: {e}")
        if server:
            try:
                stop_server(server)
            except Exception as e:
                print(f"Error stopping HTTP server: {e}")

    # Final result logging
    print("\n======================================================================")
    if success:
        print("                     ALL TESTS COMPLETED SUCCESSFULLY (PASSED)        ")
        print("======================================================================")
        sys.exit(0)
    else:
        print("                     TEST RUN ENCOUNTERED FAILURES (FAILED)           ")
        print("======================================================================")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_tests())
