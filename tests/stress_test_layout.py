import asyncio
import os
import sys
from server import start_server, stop_server
from cdp_client import CDPClient

async def run_layout_stress_test():
    success = True
    print("======================================================================")
    print("                    STARTING LAYOUT RESPONSIVENESS STRESS TEST        ")
    print("======================================================================")

    # Start HTTP Test Server
    server = None
    try:
        server = start_server(8000)
    except Exception as e:
        print(f"[ERROR] Failed to start HTTP server: {e}")
        sys.exit(1)

    client = None
    try:
        # Start CDP Client
        client = CDPClient(port=9225)
        await client.start()
        
        # Navigate to the page
        await client.navigate("http://localhost:8000/index.html")
        
        # Wait for loader to be gone
        print("[TEST] Waiting for page loader to dismiss...")
        for i in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        
        await asyncio.sleep(0.5)

        # Viewports to test
        viewports = [320, 360, 375, 414, 480, 568, 600, 640, 768, 800, 960, 1024]
        
        print("\n--- Scanning for Horizontal Viewport Breakouts & Overflows ---")
        for width in viewports:
            print(f"\n[Testing Viewport Width: {width}px]")
            await client.set_viewport(width, 800)
            await asyncio.sleep(0.5)  # Let layout settle
            
            # Check document-level overflow
            doc_scroll_width = await client.eval_js("document.documentElement.scrollWidth")
            window_inner_width = await client.eval_js("window.innerWidth")
            body_scroll_width = await client.eval_js("document.body.scrollWidth")
            
            has_overflow = doc_scroll_width > window_inner_width or body_scroll_width > window_inner_width
            
            if has_overflow:
                print(f"  [FAILED] Horizontal overflow detected! window.innerWidth={window_inner_width}px, document.scrollWidth={doc_scroll_width}px, body.scrollWidth={body_scroll_width}px")
                success = False
                
                # Identify which element(s) break out of the viewport width
                breakout_elements = await client.eval_js(f"""
                    (function() {{
                        const elements = Array.from(document.querySelectorAll('*'));
                        const breakouts = [];
                        const wWidth = window.innerWidth;
                        for (let el of elements) {{
                            const rect = el.getBoundingClientRect();
                            const style = window.getComputedStyle(el);
                            // Only check elements that are visible and occupy space
                            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && rect.width > 0 && rect.height > 0) {{
                                if (rect.right > wWidth + 1) {{
                                    // Traverse ancestors to get a selector-like string
                                    let path = el.tagName.toLowerCase();
                                    if (el.id) path += '#' + el.id;
                                    if (el.className) path += '.' + el.className.trim().replace(/\\s+/g, '.');
                                    breakouts.push({{
                                        selector: path,
                                        width: rect.width,
                                        left: rect.left,
                                        right: rect.right,
                                        scrollWidth: el.scrollWidth,
                                        outerHTML: el.outerHTML.substring(0, 100) + '...'
                                    }});
                                }}
                            }}
                        }}
                        return breakouts;
                    }})()
                """)
                
                if breakout_elements:
                    print(f"    Elements causing breakout ({len(breakout_elements)}):")
                    # To keep output readable, show up to 5 elements
                    for idx, el in enumerate(breakout_elements[:5]):
                        print(f"      {idx+1}. Selector: {el['selector']}")
                        print(f"         Rect: left={el['left']:.2f}, right={el['right']:.2f}, width={el['width']:.2f} (viewport width: {window_inner_width})")
                        print(f"         HTML snippet: {el['outerHTML']}")
                else:
                    print("    Could not determine specific breakout elements via bounding rect.")
            else:
                print(f"  [PASS] No horizontal overflow (scrollWidth={doc_scroll_width}px matches viewport innerWidth={window_inner_width}px).")

    except Exception as e:
        print(f"[ERROR] Exception during stress testing: {e}")
        import traceback
        traceback.print_exc()
        success = False
    finally:
        if client:
            await client.close()
        if server:
            stop_server(server)

    print("\n======================================================================")
    if success:
        print("                  STRESS TEST COMPLETED: ALL PASSED                   ")
        print("======================================================================")
        sys.exit(0)
    else:
        print("                  STRESS TEST COMPLETED: ENCOUNTERED FAILURES         ")
        print("======================================================================")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_layout_stress_test())
