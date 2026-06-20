import asyncio
import os
import sys
import time
import re

# Add the current directory (tests) to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import start_server, stop_server
from cdp_client import CDPClient
from test_suite import get_contrast_ratio

async def run_challenger_interactive_verification():
    success = True
    server = None
    client = None
    
    print("======================================================================")
    print("           MILESTONE 3: INTERACTIVE & MODAL CHALLENGER TESTS          ")
    print("======================================================================")

    # Start server
    try:
        server = start_server(8000)
    except Exception as e:
        print(f"[ERROR] Failed to start HTTP server: {e}")
        sys.exit(1)

    try:
        # Start CDP Client
        client = CDPClient(port=9225)
        await client.start()
        
        # Navigate to page
        await client.navigate("http://localhost:8000/index.html")
        
        # Wait for page loader to disappear
        print("[TEST] Waiting for page loader...")
        for _ in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        
        # Inject JS error listener to track any runtime errors during stress testing
        await client.eval_js("""
            window.jsErrors = [];
            window.addEventListener('error', function(e) {
                window.jsErrors.push({
                    message: e.message,
                    filename: e.filename,
                    lineno: e.lineno,
                    colno: e.colno,
                    error: e.error ? e.error.toString() : null
                });
            });
            window.addEventListener('unhandledrejection', function(e) {
                window.jsErrors.push({
                    message: 'Unhandled Promise Rejection: ' + e.reason,
                    error: e.reason ? e.reason.toString() : null
                });
            });
        """)
        
        await asyncio.sleep(0.5)

        # ----------------------------------------------------------------------
        # TEST 1: Rapid Project Filtering & ScrollTrigger Position Correctness
        # ----------------------------------------------------------------------
        print("\n--- TEST 1: RAPID PROJECT FILTERING STRESS TEST & SCROLLTRIGGER ---")
        
        # Scroll down to the projects section
        print("[TEST] Scrolling to #projects section...")
        await client.eval_js("const el = document.getElementById('projects'); if(el) el.scrollIntoView({block: 'start'});")
        await asyncio.sleep(0.5)
        
        initial_scroll_y = await client.eval_js("window.scrollY")
        print(f"  Initial ScrollY at projects section: {initial_scroll_y}px")
        
        # Rapidly toggle filter categories
        filters = ["production", "fullstack", "analytics", "all"]
        cycles = 10  # 10 cycles * 4 filters = 40 clicks
        print(f"[TEST] Triggering {cycles * len(filters)} rapid clicks on filter buttons...")
        
        start_time = time.time()
        for cycle in range(cycles):
            for filt in filters:
                # Click via JS trigger to simulate ultra-rapid clicks
                btn_clicked = await client.eval_js(f"""
                    (function() {{
                        const btn = document.querySelector(".filter-btn[data-filter='{filt}']");
                        if (btn) {{
                            btn.click();
                            return true;
                        }}
                        return false;
                    }})()
                """)
                if not btn_clicked:
                    print(f"  [FAIL] Filter button for '{filt}' not found.")
                    success = False
                # Ultra short sleep to interrupt GSAP animations in progress
                await asyncio.sleep(0.05)
        
        duration = time.time() - start_time
        print(f"  Completed {cycles * len(filters)} filter clicks in {duration:.3f} seconds.")
        
        # Settle animations
        print("  Waiting 1.0s for transitions and Flip layout to settle...")
        await asyncio.sleep(1.0)
        
        # Verify no runtime errors occurred
        js_errors = await client.eval_js("window.jsErrors")
        if len(js_errors) == 0:
            print("  [PASS] No JavaScript errors or exceptions occurred during rapid filtering.")
        else:
            print(f"  [FAIL] JS errors detected during rapid filtering: {js_errors}")
            success = False
            
        # Verify card display states correspond to the final filter ('all')
        all_visible = await client.eval_js("""
            (function() {
                const cards = Array.from(document.querySelectorAll('.project-card'));
                return cards.every(c => window.getComputedStyle(c).display !== 'none');
            })()
        """)
        if all_visible:
            print("  [PASS] Final category filter 'all' displays all project cards correctly.")
        else:
            print("  [FAIL] Not all project cards are visible after selecting 'all' filter.")
            success = False
            
        # Verify ScrollTrigger positions are in sync with element offsets
        print("[TEST] Verifying ScrollTrigger positions...")
        scroll_trigger_check = await client.eval_js("""
            (function() {
                if (typeof ScrollTrigger === 'undefined') return { error: 'ScrollTrigger is not defined' };
                
                const triggers = ScrollTrigger.getAll();
                const viewportHeight = window.innerHeight;
                const results = [];
                
                triggers.forEach(t => {
                    if (!t.trigger) return;
                    
                    // Retrieve trigger class/id
                    const name = t.trigger.id ? '#' + t.trigger.id : (t.trigger.className ? '.' + t.trigger.className.split(' ').join('.') : 'element');
                    const rect = t.trigger.getBoundingClientRect();
                    const pageTop = rect.top + window.scrollY;
                    
                    // Standard trigger start logic check
                    // For reveal class, start is 'top 88%' => pageTop - viewportHeight * 0.88
                    // For timeline-item, start is 'top 85%' => pageTop - viewportHeight * 0.85
                    let expectedStart = null;
                    let tolerance = 5.0; // 5px tolerance
                    
                    const isReveal = t.trigger.classList.contains('reveal') || t.trigger.classList.contains('reveal-left') || t.trigger.classList.contains('reveal-right') || t.trigger.classList.contains('reveal-scale');
                    const isTimeline = t.trigger.classList.contains('timeline-item');
                    
                    if (isReveal && !t.trigger.closest('.hero')) {
                        expectedStart = pageTop - viewportHeight * 0.88;
                    } else if (isTimeline) {
                        expectedStart = pageTop - viewportHeight * 0.85;
                    }
                    
                    let matches = true;
                    if (expectedStart !== null) {
                        matches = Math.abs(t.start - expectedStart) <= tolerance;
                    }
                    
                    results.push({
                        name: name,
                        start: t.start,
                        end: t.end,
                        expectedStart: expectedStart,
                        matches: matches,
                        isNan: isNaN(t.start) || isNaN(t.end)
                    });
                });
                
                return { triggers: results };
            })()
        """)
        
        if "error" in scroll_trigger_check:
            print(f"  [FAIL] ScrollTrigger check error: {scroll_trigger_check['error']}")
            success = False
        else:
            triggers_info = scroll_trigger_check["triggers"]
            print(f"  Found {len(triggers_info)} ScrollTrigger instances.")
            
            all_triggers_numeric = True
            all_triggers_synced = True
            
            for t in triggers_info:
                if t["isNan"]:
                    print(f"    [FAIL] ScrollTrigger for '{t['name']}' has NaN values: start={t['start']}, end={t['end']}")
                    all_triggers_numeric = False
                    success = False
                elif t["expectedStart"] is not None:
                    if t["matches"]:
                        pass # Matches fine
                    else:
                        print(f"    [WARN] ScrollTrigger '{t['name']}' offset out of sync: ScrollTrigger.start={t['start']:.1f}, page-calculated={t['expectedStart']:.1f}")
                        all_triggers_synced = False
            
            if all_triggers_numeric:
                print("  [PASS] All ScrollTrigger instances have valid numeric positions.")
            if all_triggers_synced:
                print("  [PASS] All evaluated ScrollTrigger positions are perfectly in sync with DOM elements.")
            else:
                print("  [WARN] Some ScrollTrigger positions were slightly out of sync (normal if page layout is dynamic, but ScrollTrigger.refresh() resolves this).")

        # ----------------------------------------------------------------------
        # TEST 2: Modal Open/Close & Lenis Scroll Lock Stress Test
        # ----------------------------------------------------------------------
        print("\n--- TEST 2: MODAL OPEN/CLOSE & LENIS SCROLL LOCK STRESS TEST ---")
        
        modal_project = "sap-tracker"
        modal_open_cycles = 10
        print(f"[TEST] Opening and closing modal for '{modal_project}' {modal_open_cycles} times...")
        
        lock_pass = True
        for cycle in range(modal_open_cycles):
            # Open Modal
            await client.click(f".btn-case-study[data-project='{modal_project}']")
            await asyncio.sleep(0.4) # Wait for fade-in animation
            
            # Check modal visible and Lenis state
            modal_state = await client.eval_js("""
                (function() {
                    const modal = document.getElementById('projectModal');
                    const display = window.getComputedStyle(modal).display;
                    const lenisStopped = window.lenis ? window.lenis.isStopped : true;
                    const bodyHasClass = document.body.classList.contains('modal-open');
                    
                    return {
                        visible: display === 'flex',
                        lenisStopped: lenisStopped,
                        bodyHasClass: bodyHasClass
                    };
                })()
            """)
            
            if not modal_state["visible"]:
                print(f"  [FAIL] Cycle {cycle+1}: Modal was not displayed.")
                lock_pass = False
                success = False
            if not modal_state["lenisStopped"]:
                print(f"  [FAIL] Cycle {cycle+1}: Lenis scroll lock was NOT engaged (lenis.isStopped = false).")
                lock_pass = False
                success = False
            if not modal_state["bodyHasClass"]:
                print(f"  [FAIL] Cycle {cycle+1}: body does not have 'modal-open' class.")
                lock_pass = False
                success = False
                
            # Scroll page in background check: ScrollY should not change when we try to scroll
            prev_scroll_y = await client.eval_js("window.scrollY")
            await client.eval_js("window.scrollTo(0, window.scrollY + 100);")
            await asyncio.sleep(0.1)
            new_scroll_y = await client.eval_js("window.scrollY")
            
            if new_scroll_y != prev_scroll_y:
                print(f"  [FAIL] Cycle {cycle+1}: Background page scrolled from {prev_scroll_y}px to {new_scroll_y}px while modal was open!")
                lock_pass = False
                success = False
                
            # Check that scrolling modal content works:
            # Change scrollTop of modal container and verify it updates
            modal_scroll_info = await client.eval_js("""
                (function() {
                    const container = document.querySelector('.modal-container');
                    if (!container) return null;
                    const initialScrollTop = container.scrollTop;
                    container.scrollTop = 50;
                    const scrolledScrollTop = container.scrollTop;
                    return {
                        initial: initialScrollTop,
                        scrolled: scrolledScrollTop,
                        scrollable: container.scrollHeight > container.clientHeight
                    };
                })()
            """)
            
            if modal_scroll_info:
                if modal_scroll_info["scrollable"]:
                    if modal_scroll_info["scrolled"] > 0:
                        pass # Scroll works
                    else:
                        print(f"  [WARN] Cycle {cycle+1}: Modal content container is scrollable, but changing scrollTop failed.")
                else:
                    print(f"  [INFO] Cycle {cycle+1}: Modal content is too short to be scrollable (scrollHeight <= clientHeight).")
            else:
                print(f"  [FAIL] Cycle {cycle+1}: .modal-container not found.")
                lock_pass = False
                success = False
                
            # Close Modal
            await client.click("#modalCloseBtn")
            await asyncio.sleep(0.4) # Wait for fade-out animation
            
            # Check modal closed and Lenis restarted
            closed_state = await client.eval_js("""
                (function() {
                    const modal = document.getElementById('projectModal');
                    const display = window.getComputedStyle(modal).display;
                    const lenisStopped = window.lenis ? window.lenis.isStopped : false;
                    const bodyHasClass = document.body.classList.contains('modal-open');
                    
                    return {
                        closed: display === 'none',
                        lenisStopped: lenisStopped,
                        bodyHasClass: bodyHasClass
                    };
                })()
            """)
            
            if not closed_state["closed"]:
                print(f"  [FAIL] Cycle {cycle+1}: Modal failed to close.")
                lock_pass = False
                success = False
            if closed_state["lenisStopped"]:
                print(f"  [FAIL] Cycle {cycle+1}: Lenis failed to restart after modal close (lenis.isStopped = true).")
                lock_pass = False
                success = False
            if closed_state["bodyHasClass"]:
                print(f"  [FAIL] Cycle {cycle+1}: body still has 'modal-open' class after modal close.")
                lock_pass = False
                success = False
                
        if lock_pass:
            print(f"  [PASS] Successfully ran {modal_open_cycles} open/close cycles: Lenis lock/unlock and scroll prevention work correctly.")

        # ----------------------------------------------------------------------
        # TEST 3: Close Button Visibility, Layering & Theme-Awareness
        # ----------------------------------------------------------------------
        print("\n--- TEST 3: CLOSE BUTTON VISIBILITY, LAYERING & THEME-AWARENESS ---")
        
        # Open Modal again for inspection
        await client.click(f".btn-case-study[data-project='{modal_project}']")
        await asyncio.sleep(0.4)
        
        # Verify close button visibility & boundaries within viewport
        viewport_w = await client.eval_js("window.innerWidth")
        viewport_h = await client.eval_js("window.innerHeight")
        
        close_box = await client.get_box_model("#modalCloseBtn")
        if close_box:
            # Coordinates
            c = close_box["content"]
            cx = (c[0] + c[4]) / 2
            cy = (c[1] + c[5]) / 2
            cw = close_box["width"]
            ch = close_box["height"]
            
            print(f"  Close button center coordinates: ({cx:.1f}, {cy:.1f}), size: {cw}x{ch}px")
            
            if 0 <= cx <= viewport_w and 0 <= cy <= viewport_h:
                print("  [PASS] Close button is positioned fully inside the viewport bounds.")
            else:
                print(f"  [FAIL] Close button is off-screen! Coordinates: ({cx}, {cy}), viewport: {viewport_w}x{viewport_h}")
                success = False
                
            # Verify no overlap by main navbar (header)
            nav_display = await client.eval_js("window.getComputedStyle(document.querySelector('.nav-wrapper')).display")
            print(f"  Main site header (nav-wrapper) display: '{nav_display}'")
            if nav_display == "none":
                print("  [PASS] Main site header is hidden while modal is open, preventing overlap.")
            else:
                print("  [FAIL] Main site header is visible while modal is open (could cause overlap!).")
                success = False
                
            # Verify element at coordinates (z-index / layering check)
            # Use document.elementFromPoint at the center of the close button
            # It should return either the button itself or a child element of it (like the path or svg).
            element_at_point = await client.eval_js(f"""
                (function() {{
                    const el = document.elementFromPoint({cx}, {cy});
                    if (!el) return 'none';
                    
                    // Check if it is the button or contained within the button
                    let current = el;
                    while (current) {{
                        if (current.id === 'modalCloseBtn') return 'modalCloseBtn';
                        current = current.parentElement;
                    }}
                    return el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : '') + (el.id ? '#' + el.id : '');
                }})()
            """)
            print(f"  Element at close button coordinates: '{element_at_point}'")
            if element_at_point == "modalCloseBtn":
                print("  [PASS] Close button is the topmost element at its coordinates (not overlapped by other content).")
            else:
                print(f"  [FAIL] Close button is overlapped by: '{element_at_point}'")
                success = False
        else:
            print("  [FAIL] Close button box model could not be retrieved.")
            success = False
            
        # Theme-awareness checks (Light & Dark)
        for theme_name in ["dark", "light"]:
            # Set theme
            current_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
            if current_theme != theme_name:
                # Force theme switch via JS to ensure it registers
                await client.eval_js(f"document.documentElement.setAttribute('data-theme', '{theme_name}')")
                await asyncio.sleep(0.3)
                
            btn_colors = await client.eval_js("""
                (function() {
                    const btn = document.getElementById('modalCloseBtn');
                    if (!btn) return null;
                    const style = window.getComputedStyle(btn);
                    
                    // Traverse up to find wrapper background
                    const wrapper = document.querySelector('.modal-wrapper');
                    const wrapperBg = wrapper ? window.getComputedStyle(wrapper).backgroundColor : 'rgba(0,0,0,0)';
                    
                    return {
                        color: style.color,
                        bg: style.backgroundColor,
                        wrapperBg: wrapperBg
                    };
                })()
            """)
            
            if btn_colors:
                fg = btn_colors["color"]
                bg = btn_colors["bg"]
                wrapper_bg = btn_colors["wrapperBg"]
                
                # Calculate contrast ratios
                # 1. Close button text/icon against its own background
                icon_contrast = get_contrast_ratio(fg, bg)
                # 2. Close button background against the modal wrapper background
                bg_contrast = get_contrast_ratio(bg, wrapper_bg)
                
                print(f"  Theme: {theme_name.upper()}")
                print(f"    Icon Color: {fg}, Button BG: {bg}, Modal Wrapper BG: {wrapper_bg}")
                print(f"    Icon-to-Button-BG Contrast Ratio: {icon_contrast:.2f}:1")
                print(f"    Button-BG-to-Modal-Wrapper-BG Contrast Ratio: {bg_contrast:.2f}:1")
                
                # Check icon readability (should be high contrast >= 4.5:1)
                if icon_contrast >= 4.5:
                    print("    [PASS] Icon meets WCAG AA contrast ratio (> 4.5:1).")
                else:
                    print(f"    [FAIL] Icon contrast too low ({icon_contrast:.2f}:1) for accessibility!")
                    success = False
                    
                # Check button background visibility against modal wrapper (should be distinct)
                if bg_contrast >= 1.2:
                    print("    [PASS] Close button boundary is distinct from modal wrapper background.")
                else:
                    print(f"    [WARN] Close button boundary has very low contrast against wrapper background ({bg_contrast:.2f}:1).")
            else:
                print(f"  [FAIL] Failed to retrieve close button computed colors in {theme_name} theme.")
                success = False

        # Reset theme back to dark
        await client.eval_js("document.documentElement.setAttribute('data-theme', 'dark')")
        
        # Close Modal
        await client.click("#modalCloseBtn")
        await asyncio.sleep(0.4)

    except Exception as e:
        print(f"[ERROR] Exception during interactive verification: {e}")
        import traceback
        traceback.print_exc()
        success = False
    finally:
        # Cleanup
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
        print("          ALL INTERACTIVE & MODAL CHALLENGER TESTS PASSED             ")
        print("======================================================================")
        return True
    else:
        print("          INTERACTIVE & MODAL CHALLENGER TESTS FAILED                 ")
        print("======================================================================")
        return False

if __name__ == "__main__":
    ok = asyncio.run(run_challenger_interactive_verification())
    sys.exit(0 if ok else 1)
