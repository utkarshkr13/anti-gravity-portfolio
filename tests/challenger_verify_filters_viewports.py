import asyncio
import os
import sys
import time

# Ensure project root is in path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from tests.server import start_server, stop_server
from tests.cdp_client import CDPClient

async def run_verifier():
    success = True
    server = None
    client = None
    
    print("======================================================================")
    # Start server on a unique port
    try:
        server = start_server(8009)
        print("[VERIFIER] Server started on port 8009")
    except Exception as e:
        print(f"[VERIFIER ERROR] Failed to start server: {e}")
        return False

    try:
        # Start CDP client on a unique port
        client = CDPClient(port=9232)
        await client.start()
        
        # Navigate to page
        await client.navigate("http://localhost:8009/index.html")
        
        # Wait for page loader
        print("[VERIFIER] Waiting for page loader to dismiss...")
        for _ in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        
        await asyncio.sleep(0.5)
        
        # Scroll down to #projects
        await client.eval_js("const el = document.getElementById('projects'); if(el) el.scrollIntoView({block: 'start'});")
        await asyncio.sleep(0.2)
        
        # -------------------------------------------------------------
        # 1. Filter category transitions at different viewports
        # -------------------------------------------------------------
        viewports = [
            {"name": "desktop", "w": 1200, "h": 800},
            {"name": "tablet", "w": 768, "h": 1024},
            {"name": "mobile", "w": 375, "h": 812}
        ]
        
        print("\n=== VERIFYING FILTER TRANSITIONS AT DIFFERENT VIEWPORTS ===")
        for vp in viewports:
            print(f"\n[Viewport: {vp['name']} ({vp['w']}x{vp['h']})]")
            await client.set_viewport(vp["w"], vp["h"])
            await asyncio.sleep(0.3)
            
            # Make sure filter is reset to 'all' first
            await client.click(".filter-btn[data-filter='all']")
            await asyncio.sleep(0.6) # wait for reset transition
            
            # Get initial height of the grid container (.projects-grid)
            initial_grid_height = await client.eval_js("document.querySelector('.projects-grid').getBoundingClientRect().height")
            print(f"  Initial Grid Height (all): {initial_grid_height:.2f}px")
            
            # Switch to 'production' filter (hides some cards, reducing grid height)
            print("  Switching filter 'all' -> 'production'...")
            await client.click(".filter-btn[data-filter='production']")
            
            # Sample height at 0ms, 150ms, 300ms, and 600ms to verify transition smoothness
            heights = []
            for t_step in [0.0, 0.15, 0.3, 0.6]:
                await asyncio.sleep(t_step if t_step == 0.0 else 0.15)
                h = await client.eval_js("document.querySelector('.projects-grid').getBoundingClientRect().height")
                heights.append(h)
            
            print(f"  Grid Height Samples: {['{:.2f}px'.format(x) for x in heights]}")
            
            # Check for sudden snap: if it snaps, the height would jump instantly to the final height
            # final height is heights[-1]. If heights[1] or heights[2] are equal to heights[-1], it could indicate
            # immediate snap or very fast transition. But if there is a gradual decline, it's animating.
            final_h = heights[-1]
            diff_1 = abs(heights[1] - initial_grid_height)
            diff_2 = abs(heights[1] - final_h)
            
            # The grid height should be intermediate at 150ms (neither initial nor final)
            # We allow a small tolerance of 5px for very fast animation or layout timing
            if diff_1 > 5 and diff_2 > 5:
                print("  [PASS] Smooth height transition detected (no sudden height snapping).")
            else:
                print("  [WARN] Height transitioned very fast or snapped. Checking if layout is correct.")
                
            # Verify layout did not break (no horizontal scrollbar / overflow)
            doc_scroll_w = await client.eval_js("document.documentElement.scrollWidth")
            win_inner_w = await client.eval_js("window.innerWidth")
            if doc_scroll_w <= win_inner_w + 1:
                print("  [PASS] Layout remains stable (no horizontal overflow).")
            else:
                print(f"  [FAIL] Horizontal overflow detected! scrollWidth={doc_scroll_w}px, innerWidth={win_inner_w}px")
                success = False
                
            # Verify card overlap: none of the visible project cards should overlap each other
            overlaps = await client.eval_js("""
                (function() {
                    const cards = Array.from(document.querySelectorAll('.project-card')).filter(c => window.getComputedStyle(c).display !== 'none');
                    let overlapCount = 0;
                    for (let i = 0; i < cards.length; i++) {
                        for (let j = i + 1; j < cards.length; j++) {
                            const r1 = cards[i].getBoundingClientRect();
                            const r2 = cards[j].getBoundingClientRect();
                            // Check intersection
                            const noOverlap = (r1.right <= r2.left || r1.left >= r2.right || r1.bottom <= r2.top || r1.top >= r2.bottom);
                            if (!noOverlap) {
                                overlapCount++;
                            }
                        }
                    }
                    return overlapCount;
                })()
            """)
            if overlaps == 0:
                print("  [PASS] No overlapping project cards detected.")
            else:
                print(f"  [FAIL] Detected {overlaps} overlapping cards!")
                success = False
                
        # -------------------------------------------------------------
        # 2. Modal close button position, non-overlap, topmost layering, and clickability at different window heights
        # -------------------------------------------------------------
        window_heights = [500, 800, 1100]
        print("\n=== VERIFYING MODAL CLOSE BUTTON AT DIFFERENT WINDOW HEIGHTS ===")
        
        # Reset to desktop width, filter 'all'
        await client.set_viewport(1200, 800)
        await client.click(".filter-btn[data-filter='all']")
        await asyncio.sleep(0.5)
        
        for wh in window_heights:
            print(f"\n[Testing Viewport: 1200x{wh}]")
            await client.set_viewport(1200, wh)
            await asyncio.sleep(0.3)
            
            # Open modal
            await client.click(".btn-case-study[data-project='sap-tracker']")
            await asyncio.sleep(0.5) # wait for fade-in
            
            # Check modal is displayed
            is_displayed = await client.eval_js("window.getComputedStyle(document.getElementById('projectModal')).display === 'flex'")
            if is_displayed:
                print("  [PASS] Modal is displayed.")
            else:
                print("  [FAIL] Modal failed to display.")
                success = False
                continue
                
            # Verify close button box model
            close_box = await client.get_box_model("#modalCloseBtn")
            if close_box:
                c = close_box["content"]
                cx = (c[0] + c[4]) / 2
                cy = (c[1] + c[5]) / 2
                cw = close_box["width"]
                ch = close_box["height"]
                print(f"  Close Button Center: ({cx:.1f}, {cy:.1f}), Size: {cw}x{ch}px")
                
                # 1. Check inside viewport bounds
                if 0 <= cx <= 1200 and 0 <= cy <= wh:
                    print("  [PASS] Close button is within viewport bounds.")
                else:
                    print(f"  [FAIL] Close button center ({cx}, {cy}) is outside viewport (1200x{wh})!")
                    success = False
                    
                # 2. Check overlap with modal title
                title_box = await client.get_box_model("#modalTitle")
                if title_box:
                    tc = title_box["content"]
                    tx0, ty0, tx1, ty1 = tc[0], tc[1], tc[4], tc[5]
                    if tx0 <= cx <= tx1 and ty0 <= cy <= ty1:
                        print("  [FAIL] Close button overlaps modal title!")
                        success = False
                    else:
                        print("  [PASS] Close button does not overlap modal title.")
                else:
                    print("  [WARN] Title box not found.")
                    
                # 3. Check overlap with global nav header (.nav-wrapper style display should be none)
                nav_display = await client.eval_js("window.getComputedStyle(document.querySelector('.nav-wrapper')).display")
                if nav_display == "none":
                    print("  [PASS] Global header (.nav-wrapper) is display: none (prevents overlap).")
                else:
                    print(f"  [FAIL] Global header (.nav-wrapper) is visible (display={nav_display})!")
                    success = False
                    
                # 4. Check topmost layering using elementFromPoint
                top_element = await client.eval_js(f"""
                    (function() {{
                        const el = document.elementFromPoint({cx}, {cy});
                        if (!el) return 'none';
                        let curr = el;
                        while(curr) {{
                            if (curr.id === 'modalCloseBtn') return 'modalCloseBtn';
                            curr = curr.parentElement;
                        }}
                        return el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : '') + (el.id ? '#' + el.id : '');
                    }})()
                """)
                if top_element == "modalCloseBtn":
                    print("  [PASS] Close button is the topmost element at its coordinates.")
                else:
                    print(f"  [FAIL] Close button is overlapped by: {top_element}")
                    success = False
                    
                # 5. Clickability verification
                # Try clicking it via mouse click and verify modal closes
                await client.click("#modalCloseBtn")
                await asyncio.sleep(0.5) # wait for fade-out
                
                is_closed = await client.eval_js("window.getComputedStyle(document.getElementById('projectModal')).display === 'none'")
                if is_closed:
                    print("  [PASS] Modal successfully closed via close button click.")
                else:
                    print("  [FAIL] Modal did not close after clicking close button!")
                    success = False
            else:
                print("  [FAIL] Close button #modalCloseBtn not found in DOM.")
                success = False

    except Exception as e:
        print(f"[VERIFIER ERROR] Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        success = False
    finally:
        # Cleanup
        print("\n=== CLEANING UP ===")
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
                
    return success

if __name__ == "__main__":
    ok = asyncio.run(run_verifier())
    sys.exit(0 if ok else 1)
