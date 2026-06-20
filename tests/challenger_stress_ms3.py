import asyncio
import os
import sys
import time
from server import start_server, stop_server
from cdp_client import CDPClient
from test_suite import get_contrast_ratio

async def run_challenger_ms3_tests():
    success = True
    server = None
    client = None

    print("======================================================================")
    print("               MILESTONE 3 INTERACTIVE CHALLENGER STRESS TESTS        ")
    print("======================================================================")

    # 1. Launch HTTP Test Server
    try:
        server = start_server(8004)
        print("[SERVER] Started on port 8004")
    except Exception as e:
        print(f"[ERROR] Failed to start HTTP server: {e}")
        sys.exit(1)

    try:
        # 2. Start CDP Client
        client = CDPClient(port=9227)
        await client.start()

        # 3. Navigate to the page
        await client.navigate("http://localhost:8004/index.html")

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
        # SCENARIO 1: Rapid Project Filtering Stress Test
        # ---------------------------------------------------------
        print("\n--- 1. Scenario: Rapid Project Filtering Stress Test ---")
        
        categories = ["all", "production", "fullstack", "analytics"]
        cycles = 10  # 10 cycles of all 4 categories = 40 clicks
        
        print(f"[TEST] Clicking categories rapidly {cycles * len(categories)} times...")
        
        # Capture initial positions of elements to ensure they don't break
        initial_card_count = await client.eval_js("document.querySelectorAll('.project-card').length")
        print(f"  Total project cards on page: {initial_card_count}")
        
        start_time = time.time()
        for cycle in range(cycles):
            for cat in categories:
                # Click the filter button using JS click for speed
                await client.eval_js(f"document.querySelector('.filter-btn[data-filter=\"{cat}\"]').click();")
                await asyncio.sleep(0.05)  # Very fast cycling, shorter than animation duration (0.5s)
                
        duration = time.time() - start_time
        print(f"  Completed rapid clicks in {duration:.3f} seconds.")
        
        # Wait for layout to settle (0.6s is more than the 0.5s Flip transition duration)
        print("  Waiting 1.0s for transitions to settle...")
        await asyncio.sleep(1.0)
        
        # Verify that ScrollTrigger positions are correct and ScrollTrigger.refresh() doesn't fail
        scroll_trigger_ok = await client.eval_js("""
            (function() {
                try {
                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                        return true;
                    }
                    return false;
                } catch(e) {
                    return false;
                }
            })()
        """)
        
        if scroll_trigger_ok:
            print("  [PASS] ScrollTrigger refreshed successfully after rapid filtering.")
        else:
            print("  [FAIL] ScrollTrigger is not defined or threw an error on refresh.")
            success = False
            
        # Check that cards do not have lingering temporary inline positioning (like position absolute or incorrect transform)
        # after animation settles. GSAP Flip absolute parameter uses absolute positions during flip, but clears them after.
        lingering_absolute = await client.eval_js("""
            (function() {
                const cards = Array.from(document.querySelectorAll('.project-card'));
                const absoluteCards = cards.filter(card => {
                    const disp = window.getComputedStyle(card).display;
                    const pos = window.getComputedStyle(card).position;
                    // If card is displayed, it should not be absolute
                    return disp !== 'none' && pos === 'absolute';
                });
                return absoluteCards.map(c => c.id || c.className);
            })()
        """)
        
        if not lingering_absolute:
            print("  [PASS] No project cards have lingering absolute positioning after animation settles.")
        else:
            print(f"  [FAIL] Found cards with lingering absolute positioning: {lingering_absolute}")
            success = False

        # Verify final display state corresponds to the last clicked filter ("analytics")
        last_filter_correct = await client.eval_js("""
            (function() {
                const cards = Array.from(document.querySelectorAll('.project-card'));
                return cards.every(card => {
                    const category = card.getAttribute('data-category');
                    const display = window.getComputedStyle(card).display;
                    if (category === 'analytics') {
                        return display !== 'none';
                    } else {
                        return display === 'none';
                    }
                });
            })()
        """)
        
        if last_filter_correct:
            print("  [PASS] Final filtering state matches the last filter clicked ('analytics').")
        else:
            print("  [FAIL] Final filtering state is incorrect after rapid clicks.")
            success = False
            
        # Reset filter to 'all'
        await client.click(".filter-btn[data-filter='all']")
        await asyncio.sleep(0.6)

        # ---------------------------------------------------------
        # SCENARIO 2: Modal Open/Close Stress & Scroll Lock Verification
        # ---------------------------------------------------------
        print("\n--- 2. Scenario: Modal Open/Close Stress & Scroll Lock Verification ---")
        
        modal_open_close_cycles = 10
        print(f"[TEST] Opening and closing modal {modal_open_close_cycles} times...")
        
        modal_stress_pass = True
        
        for cycle in range(modal_open_close_cycles):
            # Click open
            await client.click(".btn-case-study[data-project='sap-tracker']")
            await asyncio.sleep(0.4) # Wait for fade-in
            
            # Verify open states
            is_visible, lenis_stopped, body_overflow = await client.eval_js("""
                (function() {
                    const modal = document.getElementById('projectModal');
                    const visible = window.getComputedStyle(modal).display === 'flex';
                    const lenisStopped = window.lenis ? window.lenis.isStopped : true;
                    const overflow = window.getComputedStyle(document.body).overflow;
                    return [visible, lenisStopped, overflow];
                })()
            """)
            
            if not is_visible:
                print(f"    [FAIL] Modal not visible on open cycle {cycle + 1}.")
                modal_stress_pass = False
            if not lenis_stopped:
                print(f"    [FAIL] Lenis not stopped on open cycle {cycle + 1}.")
                modal_stress_pass = False
            if body_overflow != "hidden":
                print(f"    [FAIL] Body overflow is '{body_overflow}' instead of 'hidden' on open cycle {cycle + 1}.")
                modal_stress_pass = False
                
            # Click close
            await client.click("#modalCloseBtn")
            await asyncio.sleep(0.4) # Wait for fade-out
            
            # Verify closed states
            is_hidden, lenis_running = await client.eval_js("""
                (function() {
                    const modal = document.getElementById('projectModal');
                    const hidden = window.getComputedStyle(modal).display === 'none';
                    const lenisStopped = window.lenis ? window.lenis.isStopped : false;
                    return [hidden, !lenisStopped];
                })()
            """)
            
            if not is_hidden:
                print(f"    [FAIL] Modal not hidden on close cycle {cycle + 1}.")
                modal_stress_pass = False
            if not lenis_running:
                print(f"    [FAIL] Lenis still stopped on close cycle {cycle + 1}.")
                modal_stress_pass = False

        if modal_stress_pass:
            print(f"  [PASS] Modal opened/closed successfully {modal_open_close_cycles} times with consistent scroll lock behavior.")
        else:
            print("  [FAIL] Modal open/close stress test failed.")
            success = False

        # Open modal once more for scroll bypass testing
        await client.click(".btn-case-study[data-project='sap-tracker']")
        await asyncio.sleep(0.5)

        # Verify Scroll Bypass (parent page background scroll must not change when scrolling inside modal)
        print("[TEST] Verifying scroll bypass...")
        
        # Record initial scroll position of main page
        initial_page_scroll = await client.eval_js("window.scrollY")
        
        # Scroll the modal container down
        scroll_modal_successful = await client.eval_js("""
            (function() {
                const container = document.querySelector('.modal-container');
                if (container) {
                    container.scrollTop = 200;
                    return container.scrollTop > 0;
                }
                return false;
            })()
        """)
        
        if scroll_modal_successful:
            print("  [PASS] Modal container is scrollable and successfully scrolled down.")
        else:
            print("  [FAIL] Failed to scroll modal container.")
            success = False
            
        # Attempt to scroll main page background by executing wheel events or scrolling body
        await client.eval_js(f"window.scrollTo(0, {initial_page_scroll} + 500);")
        await asyncio.sleep(0.2)
        
        post_scroll_page_scroll = await client.eval_js("window.scrollY")
        print(f"  Main page scroll position before background scroll attempt: {initial_page_scroll}px")
        print(f"  Main page scroll position after background scroll attempt: {post_scroll_page_scroll}px")
        
        if post_scroll_page_scroll == initial_page_scroll:
            print("  [PASS] No scroll bypass: scrolling attempt did not affect main page scroll position.")
        else:
            print("  [FAIL] Lenis scroll bypass: parent page scrolled while modal was active.")
            success = False

        # ---------------------------------------------------------
        # SCENARIO 3: Modal Close Button Visibility & Header Overlap
        # ---------------------------------------------------------
        print("\n--- 3. Scenario: Close Button Visibility, Theme-Awareness, and Position ---")
        
        # Bounding box check of close button vs header elements
        close_btn_box = await client.get_box_model("#modalCloseBtn")
        title_box = await client.get_box_model("#modalTitle")
        
        if close_btn_box:
            # Check if Close Button is visible (non-zero size)
            if close_btn_box["width"] > 0 and close_btn_box["height"] > 0:
                print(f"  [PASS] Modal Close button exists with size {close_btn_box['width']}x{close_btn_box['height']}.")
            else:
                print("  [FAIL] Modal Close button has zero dimensions.")
                success = False
                
            # Verify Close button is within viewport bounds
            # Bounding box content coordinates: [x0, y0, x1, y1, x2, y2, x3, y3]
            cx = (close_btn_box["content"][0] + close_btn_box["content"][4]) / 2
            cy = (close_btn_box["content"][1] + close_btn_box["content"][5]) / 2
            viewport = await client.eval_js("({w: window.innerWidth, h: window.innerHeight})")
            
            if 0 <= cx <= viewport["w"] and 0 <= cy <= viewport["h"]:
                print(f"  [PASS] Modal Close button is inside viewport bounds: center ({cx:.2f}, {cy:.2f}).")
            else:
                print(f"  [FAIL] Modal Close button is outside viewport bounds: center ({cx:.2f}, {cy:.2f}) vs viewport size {viewport['w']}x{viewport['h']}.")
                success = False
                
            # Check overlap with modal title
            if title_box:
                tx0, ty0, tx1, ty1 = title_box["content"][0], title_box["content"][1], title_box["content"][4], title_box["content"][5]
                # Center of close button should not be inside title bounding box
                if tx0 <= cx <= tx1 and ty0 <= cy <= ty1:
                    print("  [FAIL] Close button overlaps with modal title!")
                    success = False
                else:
                    print("  [PASS] Close button does not overlap with modal title.")
            else:
                print("  [WARN] Could not retrieve #modalTitle box model.")
                
            # Check if global header/navbar is display none while modal is open, to prevent any overlap
            nav_wrapper_style = await client.eval_js("window.getComputedStyle(document.querySelector('.nav-wrapper')).display")
            if nav_wrapper_style == "none":
                print("  [PASS] Main header (.nav-wrapper) is hidden (display: none) when modal is open (preventing overlap).")
            else:
                print(f"  [FAIL] Main header (.nav-wrapper) is visible (display: {nav_wrapper_style}) when modal is open.")
                success = False
        else:
            print("  [FAIL] Modal Close button '#modalCloseBtn' was not found.")
            success = False

        # Theme-awareness: Verify color contrast of Close Button in both themes
        print("[TEST] Verifying Close Button theme contrast...")
        
        # Test Dark Mode (currently active)
        dark_colors = await client.eval_js("""
            (function() {
                const btn = document.getElementById('modalCloseBtn');
                const style = window.getComputedStyle(btn);
                return {
                    color: style.color,
                    bg: style.backgroundColor,
                    border: style.borderColor
                };
            })()
        """)
        
        dark_ratio = get_contrast_ratio(dark_colors["color"], dark_colors["bg"])
        print(f"  Dark Mode Close Button: text={dark_colors['color']}, bg={dark_colors['bg']}, border={dark_colors['border']}")
        print(f"    Contrast ratio: {dark_ratio:.2f}:1")
        if dark_ratio >= 4.5:
            print("    [PASS] Close button text has WCAG AA contrast (>= 4.5:1) in dark mode.")
        else:
            print("    [WARN] Close button text has low contrast in dark mode.")
            
        # Switch to Light Mode
        # First close modal to toggle theme, then reopen
        await client.click("#modalCloseBtn")
        await asyncio.sleep(0.4)
        
        # Toggle theme to light
        await client.eval_js("document.getElementById('themeToggle').click();")
        await asyncio.sleep(0.5)
        
        # Reopen modal
        await client.click(".btn-case-study[data-project='sap-tracker']")
        await asyncio.sleep(0.4)
        
        # Check in light mode
        light_colors = await client.eval_js("""
            (function() {
                const btn = document.getElementById('modalCloseBtn');
                const style = window.getComputedStyle(btn);
                return {
                    color: style.color,
                    bg: style.backgroundColor,
                    border: style.borderColor
                };
            })()
        """)
        
        light_ratio = get_contrast_ratio(light_colors["color"], light_colors["bg"])
        print(f"  Light Mode Close Button: text={light_colors['color']}, bg={light_colors['bg']}, border={light_colors['border']}")
        print(f"    Contrast ratio: {light_ratio:.2f}:1")
        if light_ratio >= 4.5:
            print("    [PASS] Close button text has WCAG AA contrast (>= 4.5:1) in light mode.")
        else:
            print("    [WARN] Close button text has low contrast in light mode.")
            
        if dark_ratio >= 3.0 and light_ratio >= 3.0:
            print("  [PASS] Close button has sufficient contrast in both themes.")
        else:
            print("  [FAIL] Close button has insufficient contrast (< 3.0:1) in at least one theme.")
            success = False
            
        # Restore theme to dark
        await client.click("#modalCloseBtn")
        await asyncio.sleep(0.4)
        await client.eval_js("document.getElementById('themeToggle').click();")
        await asyncio.sleep(0.5)

    except Exception as e:
        print(f"[ERROR] Exception during MS3 stress tests: {e}")
        import traceback
        traceback.print_exc()
        success = False
    finally:
        # Clean up
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

    print("======================================================================")
    if success:
        print("            ALL MILESTONE 3 CHALLENGER STRESS TESTS PASSED           ")
        print("======================================================================")
        sys.exit(0)
    else:
        print("            MILESTONE 3 CHALLENGER STRESS TESTS FAILED                ")
        print("======================================================================")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_challenger_ms3_tests())
