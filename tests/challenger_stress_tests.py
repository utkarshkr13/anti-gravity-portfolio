import asyncio
import os
import sys
import time

# Add the current directory (tests) to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import start_server, stop_server
from cdp_client import CDPClient

async def run_challenger_tests():
    success = True
    print("======================================================================")
    print("                  THEME & CONTRAST CHALLENGER STRESS TESTS            ")
    print("======================================================================")

    # 1. Launch HTTP Test Server
    server = None
    try:
        server = start_server(8000)
    except Exception as e:
        print(f"[ERROR] Failed to start HTTP server: {e}")
        sys.exit(1)

    client = None
    try:
        # 2. Start CDP Client
        client = CDPClient(port=9225)
        await client.start()
        
        # 3. Navigate to the page
        await client.navigate("http://localhost:8000/index.html")
        
        # Wait for the loader to be dismissed
        print("[TEST] Waiting for loader to dismiss...")
        for i in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        else:
            print("[WARN] Page loader did not dismiss in time, forcing display = none.")
            await client.eval_js("if(document.getElementById('pageLoader')) document.getElementById('pageLoader').style.display = 'none';")

        await asyncio.sleep(0.5)

        # ---------------------------------------------------------
        # VERIFICATION 1: Rapid Theme Switching & Layout Stability
        # ---------------------------------------------------------
        print("\n--- 1. Verification: Rapid Theme Switching & Events ---")
        
        # Setup theme-change event counter in the page context
        await client.eval_js("""
            window.themeChangeEventCount = 0;
            window.addEventListener('theme-change', () => {
                window.themeChangeEventCount++;
            });
        """)
        
        # Rapidly click themeToggle 50 times
        iterations = 50
        print(f"[TEST] Triggering {iterations} rapid clicks on #themeToggle...")
        
        start_time = time.time()
        for _ in range(iterations):
            await client.eval_js("document.getElementById('themeToggle').click();")
        duration = time.time() - start_time
        
        print(f"[TEST] Completed {iterations} clicks in {duration:.3f} seconds.")
        
        # Let's verify event count
        event_count = await client.eval_js("window.themeChangeEventCount")
        print(f"  Event count triggered: {event_count}")
        if event_count == iterations:
            print(f"  [PASS] Exactly {iterations} theme-change events were dispatched.")
        else:
            print(f"  [FAIL] Expected {iterations} theme-change events, but got {event_count}.")
            success = False
            
        # Verify document layout is stable and has no delay or layout issues
        body_height = await client.eval_js("document.body.clientHeight")
        body_width = await client.eval_js("document.body.clientWidth")
        print(f"  Layout dimensions after rapid switches: {body_width}x{body_height}px.")
        if body_height > 0 and body_width > 0:
            print("  [PASS] Layout remains stable and non-collapsed.")
        else:
            print("  [FAIL] Layout collapsed to zero height or width.")
            success = False

        # ---------------------------------------------------------
        # VERIFICATION 2: Canvas Ticker Opacities & Colors
        # ---------------------------------------------------------
        print("\n--- 2. Verification: Canvas Ticker Contrast Opacities & Colors ---")
        
        # Ensure we are in Light mode first
        current_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
        if current_theme != "light":
            await client.click("#themeToggle")
            await asyncio.sleep(0.5)
            current_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
        
        print(f"  Testing Canvas fillStyles in theme: {current_theme.upper()}")
        
        # Inject interceptor for fillStyle
        start_interceptor = """
        (function() {
            window.capturedStyles = [];
            const originalSet = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle').set;
            window._originalFillStyleSet = originalSet;
            Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
                set: function(val) {
                    window.capturedStyles.push(val);
                    originalSet.call(this, val);
                },
                configurable: true
            });
        })()
        """
        
        stop_interceptor = """
        (function() {
            if (window._originalFillStyleSet) {
                Object.defineProperty(CanvasRenderingContext2D.prototype, 'fillStyle', {
                    set: window._originalFillStyleSet,
                    configurable: true
                });
            }
            const uniq = Array.from(new Set(window.capturedStyles || []));
            delete window.capturedStyles;
            delete window._originalFillStyleSet;
            return uniq;
        })()
        """
        
        # Capture light mode styles
        await client.eval_js(start_interceptor)
        await asyncio.sleep(0.3)
        light_fill_styles = await client.eval_js(stop_interceptor)
        print(f"  Fills captured in light mode: {light_fill_styles}")
        
        # Validate light mode opacities (0.35) and colors (rgba(22, 101, 52, 0.35) or rgba(185, 28, 28, 0.35))
        light_pass = True
        for fs in light_fill_styles:
            if "rgba" in fs:
                # Expecting 0.35 opacity
                if "0.35" not in fs:
                    print(f"    [WARN] Captured light mode style without 0.35 opacity: '{fs}'")
                    light_pass = False
                # Expecting light mode colors: Forest Green (22, 101, 52) or Red (185, 28, 28)
                if "22, 101, 52" not in fs and "185, 28, 28" not in fs:
                    print(f"    [WARN] Captured style with unexpected color values: '{fs}'")
                    light_pass = False
        if light_pass and len(light_fill_styles) > 0:
            print("  [PASS] Canvas Light Mode opacities (0.35) and colors render correctly.")
        else:
            print("  [FAIL] Canvas Light Mode opacities or colors are incorrect.")
            success = False

        # Switch to Dark mode
        await client.click("#themeToggle")
        await asyncio.sleep(0.5)
        current_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
        print(f"  Testing Canvas fillStyles in theme: {current_theme.upper()}")
        
        # Capture dark mode styles
        await client.eval_js(start_interceptor)
        await asyncio.sleep(0.3)
        dark_fill_styles = await client.eval_js(stop_interceptor)
        print(f"  Fills captured in dark mode: {dark_fill_styles}")
        
        # Validate dark mode opacities (0.15) and colors (rgba(34, 197, 94, 0.15) or rgba(239, 68, 68, 0.15))
        dark_pass = True
        for fs in dark_fill_styles:
            if "rgba" in fs:
                # Expecting 0.15 opacity
                if "0.15" not in fs:
                    print(f"    [WARN] Captured dark mode style without 0.15 opacity: '{fs}'")
                    dark_pass = False
                # Expecting dark mode colors: Neon Green (34, 197, 94) or CNBC Red (239, 68, 68)
                if "34, 197, 94" not in fs and "239, 68, 68" not in fs:
                    print(f"    [WARN] Captured style with unexpected color values: '{fs}'")
                    dark_pass = False
        if dark_pass and len(dark_fill_styles) > 0:
            print("  [PASS] Canvas Dark Mode opacities (0.15) and colors render correctly.")
        else:
            print("  [FAIL] Canvas Dark Mode opacities or colors are incorrect.")
            success = False

        # ---------------------------------------------------------
        # VERIFICATION 3: Category Filter Buttons Styling After Clicks
        # ---------------------------------------------------------
        print("\n--- 3. Verification: Category Filter Buttons Styling After Clicks ---")
        
        # Click the "production" filter button
        print("[TEST] Clicking '.filter-btn[data-filter=\"production\"]'...")
        await client.click(".filter-btn[data-filter=\"production\"]")
        await asyncio.sleep(0.3)
        
        # Inspect style properties of the active button
        active_btn_style = await client.eval_js("""
            (function() {
                const activeBtn = document.querySelector('.filter-btn.active');
                if (!activeBtn) return null;
                const style = window.getComputedStyle(activeBtn);
                return {
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                    borderColor: style.borderColor,
                    boxShadow: style.boxShadow,
                    opacity: style.opacity
                };
            })()
        """)
        
        print(f"  Active button style properties: {active_btn_style}")
        
        if active_btn_style:
            # Color should be white/white-ish
            # Background should be steel blue / accent color
            # Let's verify color is white
            is_text_white = "255, 255, 255" in active_btn_style["color"] or "#fff" in active_btn_style["color"]
            if is_text_white:
                print("  [PASS] Active button retains clean contrast style (white text).")
            else:
                print(f"  [WARN] Active button color is not white: '{active_btn_style['color']}'")
                
            # Verify other buttons do NOT have active class
            non_active_check = await client.eval_js("""
                (function() {
                    const allBtns = Array.from(document.querySelectorAll('.filter-btn'));
                    const activeCount = allBtns.filter(b => b.classList.contains('active')).length;
                    return activeCount === 1;
                })()
            """)
            if non_active_check:
                print("  [PASS] Exactly one filter button has the 'active' class after click.")
            else:
                print("  [FAIL] Multiple buttons or no buttons have the 'active' class.")
                success = False
        else:
            print("  [FAIL] Failed to retrieve style properties of the active filter button.")
            success = False

    except Exception as e:
        print(f"[ERROR] Exception during stress tests: {e}")
        import traceback
        traceback.print_exc()
        success = False
    finally:
        # 4. Clean up
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

    print("\n======================================================================")
    if success:
        print("                  ALL CHALLENGER STRESS TESTS PASSED                 ")
        print("======================================================================")
        sys.exit(0)
    else:
        print("                  CHALLENGER STRESS TESTS FAILED                     ")
        print("======================================================================")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_challenger_tests())
