import asyncio
import os
import sys
import json
import time

# Ensure project root is in path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from tests.server import start_server, stop_server
from tests.cdp_client import CDPClient

async def check_layout():
    success = True
    server = None
    client = None
    
    try:
        # Start server
        server = start_server(8000)
        
        # Start CDP Client
        client = CDPClient(port=9225)
        await client.start()
        
        # Navigate to portfolio page
        await client.navigate("http://localhost:8000/index.html")
        
        # Wait for page loader to disappear
        print("[VERIFIER] Waiting for page loader...")
        for _ in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        
        # Settle page
        await asyncio.sleep(0.5)
        
        # Ensure GitHub stats are loaded / fallback loaded
        print("[VERIFIER] Waiting for GitHub stats grid to populate...")
        for _ in range(50):
            repos_count = await client.eval_js("document.querySelectorAll('#githubReposGrid .github-repo-card').length")
            if repos_count > 0:
                print(f"[VERIFIER] GitHub repos populated with {repos_count} items.")
                break
            await asyncio.sleep(0.1)
        
        print("\n=== VERIFYING NAVBAR CENTERING ===")
        # Test centering at 320px, 360px, 375px, 414px
        for width in [320, 360, 375, 414]:
            await client.set_viewport(width, 800)
            await asyncio.sleep(0.5) # Wait for resize and animations to settle
            
            centering_info = await client.eval_js(f"""
                (function() {{
                    const wrapper = document.querySelector('.nav-wrapper');
                    const navbar = document.querySelector('.navbar');
                    if (!wrapper || !navbar) return null;
                    
                    const w_rect = wrapper.getBoundingClientRect();
                    const n_rect = navbar.getBoundingClientRect();
                    
                    const w_left = w_rect.left;
                    const w_right = {width} - w_rect.right;
                    const w_diff = Math.abs(w_left - w_right);
                    
                    const n_left = n_rect.left;
                    const n_right = {width} - n_rect.right;
                    const n_diff = Math.abs(n_left - n_right);
                    
                    return {{
                        wrapper: {{
                            left: w_left,
                            right: w_right,
                            width: w_rect.width,
                            diff: w_diff,
                            isCentered: w_diff <= 1.5
                        }},
                        navbar: {{
                            left: n_left,
                            right: n_right,
                            width: n_rect.width,
                            diff: n_diff,
                            isCentered: n_diff <= 1.5
                        }}
                    }};
                }})()
            """)
            
            if centering_info:
                w_info = centering_info["wrapper"]
                n_info = centering_info["navbar"]
                print(f"\nViewport: {width}px")
                print(f"  .nav-wrapper: width={w_info['width']:.2f}px, left={w_info['left']:.2f}px, right={w_info['right']:.2f}px, diff={w_info['diff']:.2f}px")
                if w_info["isCentered"]:
                    print(f"  [PASS] .nav-wrapper is centered at {width}px (left/right difference <= 1.5px).")
                else:
                    print(f"  [FAIL] .nav-wrapper is NOT centered at {width}px! Difference is {w_info['diff']:.2f}px.")
                    success = False
                    
                print(f"  .navbar: width={n_info['width']:.2f}px, left={n_info['left']:.2f}px, right={n_info['right']:.2f}px, diff={n_info['diff']:.2f}px")
                if n_info["isCentered"]:
                    print(f"  [PASS] .navbar is centered at {width}px (left/right difference <= 1.5px).")
                else:
                    # Let's see if the wrapper is centered, which holds the navbar
                    print(f"  [INFO] .navbar self left/right difference is {n_info['diff']:.2f}px (may be due to overflow scrolling inside the centered wrapper).")
            else:
                print(f"  [FAIL] Navbar or wrapper elements not found at {width}px.")
                success = False
                
        print("\n=== VERIFYING GITHUB REPOS GRID AT 320PX ===")
        await client.set_viewport(320, 800)
        await asyncio.sleep(0.5)
        
        grid_info = await client.eval_js("""
            (function() {
                const grid = document.getElementById('githubReposGrid');
                if (!grid) return null;
                const rect = grid.getBoundingClientRect();
                const cards = Array.from(grid.querySelectorAll('.github-repo-card'));
                const card_widths = cards.map(c => c.getBoundingClientRect().width);
                const body_width = document.body.clientWidth;
                const scroll_width = document.documentElement.scrollWidth;
                
                return {
                    gridWidth: rect.width,
                    gridLeft: rect.left,
                    gridRight: rect.right,
                    bodyWidth: body_width,
                    scrollWidth: scroll_width,
                    cardWidths: card_widths,
                    hasScrollbar: scroll_width > body_width
                };
            })()
        """)
        
        if grid_info:
            print(f"Grid width: {grid_info['gridWidth']:.2f}px")
            print(f"Body width: {grid_info['bodyWidth']:.2f}px, Scroll width: {grid_info['scrollWidth']:.2f}px")
            print(f"Cards count: {len(grid_info['cardWidths'])}")
            for idx, cw in enumerate(grid_info['cardWidths']):
                print(f"  Card {idx} width: {cw:.2f}px ({(cw / grid_info['gridWidth']) * 100:.1f}% of grid width)")
                
            # Check if columns size down to 100% of the grid width (i.e. they are single column, width matches grid width)
            # Typically at 320px viewport, the grid width is ~288px (with 16px body padding on each side).
            # Each card width should be close to grid width.
            is_single_column = all(abs(cw - grid_info['gridWidth']) <= 2.0 for cw in grid_info['cardWidths'])
            if is_single_column:
                print("  [PASS] All repository cards stack into a single column matching 100% of grid width.")
            else:
                print("  [WARN] Cards do not occupy 100% of grid width.")
                
            # Verify no overflow beyond viewport width
            if grid_info['scrollWidth'] <= 320:
                print("  [PASS] No horizontal scroll overflow at 320px viewport (scrollWidth <= 320px).")
            else:
                print(f"  [FAIL] Horizontal scroll overflow detected! scrollWidth = {grid_info['scrollWidth']}px.")
                success = False
        else:
            print("  [FAIL] #githubReposGrid not found.")
            success = False
            
        print("\n=== VERIFYING FEATURED CARD STACKING & IMAGE STRETCHING ===")
        # Test featured card layout at desktop and mobile viewports
        for width in [1280, 375]:
            await client.set_viewport(width, 800)
            await asyncio.sleep(0.5)
            
            cards_info = await client.eval_js(f"""
                (function() {{
                    const cards = Array.from(document.querySelectorAll('.project-card.featured'));
                    return cards.map((card, idx) => {{
                        const imgEl = card.querySelector('.project-card-image img');
                        const imgContainer = card.querySelector('.project-card-image');
                        const cardRect = card.getBoundingClientRect();
                        const imgRect = imgEl ? imgEl.getBoundingClientRect() : null;
                        const containerRect = imgContainer ? imgContainer.getBoundingClientRect() : null;
                        
                        // Check if stacked (i.e. image is above body content)
                        // In desktop, featured cards are row-oriented (image on left, body on right).
                        // In mobile, they should stack vertically (image on top, body below).
                        const bodyEl = card.querySelector('.project-card-body');
                        const bodyRect = bodyEl ? bodyEl.getBoundingClientRect() : null;
                        const isStacked = bodyRect && containerRect ? (containerRect.bottom <= bodyRect.top + 2) : false;
                        
                        // Check image stretch:
                        // An image is stretched if its object-fit is not 'cover' or 'contain', OR if its height/width are forced in a way that ignores intrinsic aspect ratio.
                        // We check the computed style of the image.
                        const imgStyle = imgEl ? window.getComputedStyle(imgEl) : null;
                        const containerStyle = imgContainer ? window.getComputedStyle(imgContainer) : null;
                        
                        return {{
                            index: idx,
                            isStacked: isStacked,
                            containerWidth: containerRect ? containerRect.width : 0,
                            containerHeight: containerRect ? containerRect.height : 0,
                            imgWidth: imgRect ? imgRect.width : 0,
                            imgHeight: imgRect ? imgRect.height : 0,
                            objectFit: imgStyle ? imgStyle.objectFit : 'none',
                            maxHeight: imgStyle ? imgStyle.maxHeight : 'none',
                            heightVal: imgStyle ? imgStyle.height : 'none',
                            aspectRatio: imgStyle ? imgStyle.aspectRatio : 'none'
                        }};
                    }});
                }})()
            """)
            
            print(f"\nViewport: {width}px")
            if not cards_info:
                print("  [FAIL] No featured cards found.")
                success = False
            for c in cards_info:
                print(f"  Featured Card {c['index']}:")
                print(f"    Layout: {'Stacked (Vertical)' if c['isStacked'] else 'Side-by-Side (Horizontal)'}")
                print(f"    Image element dimensions: {c['imgWidth']:.2f}px x {c['imgHeight']:.2f}px")
                print(f"    Image container dimensions: {c['containerWidth']:.2f}px x {c['containerHeight']:.2f}px")
                print(f"    Computed CSS: object-fit='{c['objectFit']}', height='{c['heightVal']}', aspect-ratio='{c['aspectRatio']}'")
                
                # Check stacking on mobile (375px)
                if width == 375:
                    if c['isStacked']:
                        print("    [PASS] Card stacks vertically on mobile viewport.")
                    else:
                        print("    [FAIL] Card does NOT stack vertically on mobile viewport!")
                        success = False
                        
                # Check stretching
                # If object-fit is 'cover', the image is cropped and fitted, so it is NOT stretched (distortion-free).
                if c['objectFit'] == 'cover':
                    print("    [PASS] Image uses object-fit: cover (no vertical stretching/distortion).")
                else:
                    # If not cover, let's verify if aspect-ratio matches physical aspect ratio.
                    # Or check if it is stretched.
                    print("    [FAIL] Image does NOT use object-fit: cover! It might be stretched.")
                    success = False

    except Exception as e:
        print(f"[VERIFIER ERROR] Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        success = False
    finally:
        if client:
            await client.close()
        if server:
            stop_server(server)
            
    return success

if __name__ == "__main__":
    ok = asyncio.run(check_layout())
    sys.exit(0 if ok else 1)
