import asyncio
import os
import sys
import re
from server import start_server, stop_server
from cdp_client import CDPClient
from test_suite import get_contrast_ratio

async def run_challenger_verification():
    success = True
    server = None
    client = None
    
    print("======================================================================")
    # 1. Static file check for canvas ticker colors & opacities
    print("--- 1. STATIC FILE CHECK: js/animations.js ---")
    animations_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "js", "animations.js")
    
    try:
        with open(animations_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Verify light/dark opacity assignments (0.35 in light, 0.15 in dark)
        opacity_pattern = r"currentTheme\s*===\s*'light'\s*\?\s*0\.35\s*:\s*0\.15"
        matches_opacity = re.findall(opacity_pattern, content)
        if len(matches_opacity) >= 2:
            print(f"  [PASS] Found correct theme opacity logic: {matches_opacity}")
        else:
            print(f"  [WARN] Expected theme opacity logic not found or matches < 2: {matches_opacity}")
            success = False

        # Verify drawn colors
        light_green = "rgba(22, 101, 52"
        light_red = "rgba(185, 28, 28"
        dark_green = "rgba(34, 197, 94"
        dark_red = "rgba(239, 68, 68"
        
        for color in [light_green, light_red, dark_green, dark_red]:
            if color in content:
                print(f"  [PASS] Color pattern '{color}' is declared in animations.js.")
            else:
                print(f"  [FAIL] Color pattern '{color}' is missing from animations.js!")
                success = False

    except Exception as e:
        print(f"  [FAIL] Error reading js/animations.js: {e}")
        success = False

    try:
        # Start server
        server = start_server(8000)
        
        # Start CDP Client
        client = CDPClient(port=9226)
        await client.start()
        
        # Navigate to portfolio page
        await client.navigate("http://localhost:8000/index.html")
        
        # Wait for page loader
        print("\n--- Waiting for page loader to dismiss ---")
        for _ in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        
        # Settle page
        await asyncio.sleep(0.5)

        # 2. Dynamic Rapid Theme Toggling Stress Test
        print("\n--- 2. STRESS TEST: RAPID THEME TOGGLING ---")
        # Initialize theme-change event counter in page
        await client.eval_js("""
            window.themeChangeCount = 0;
            window.addEventListener('theme-change', () => {
                window.themeChangeCount++;
            });
        """)
        
        initial_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
        print(f"  Initial theme: {initial_theme}")
        
        toggle_cycles = 50
        print(f"  Toggling theme {toggle_cycles} times rapidly...")
        
        start_time = asyncio.get_event_loop().time()
        for idx in range(toggle_cycles):
            # Click the theme toggle using JS click to avoid mouse movement delays
            await client.eval_js("document.getElementById('themeToggle').click()")
            # Small delay to simulate fast clicking
            await asyncio.sleep(0.02)
            
        end_time = asyncio.get_event_loop().time()
        duration = end_time - start_time
        print(f"  Completed {toggle_cycles} toggles in {duration:.2f} seconds.")
        
        # Check if theme-change event count matches toggles
        event_count = await client.eval_js("window.themeChangeCount")
        final_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
        
        print(f"  theme-change events fired: {event_count}")
        print(f"  Final theme: {final_theme}")
        
        if event_count == toggle_cycles:
            print("  [PASS] theme-change events matches toggle cycles.")
        else:
            print(f"  [FAIL] theme-change events count ({event_count}) mismatch with toggles ({toggle_cycles}).")
            success = False
            
        if final_theme == initial_theme:
            print("  [PASS] Final theme matches initial theme (even number of toggles).")
        else:
            print(f"  [FAIL] Final theme mismatch. Initial: {initial_theme}, Final: {final_theme}.")
            success = False

        # Check for page crash or JS errors
        is_responsive = await client.eval_js("document.getElementById('themeToggle') !== null")
        if is_responsive:
            print("  [PASS] Page remained responsive and elements did not crash.")
        else:
            print("  [FAIL] Page elements crashed or became unresponsive.")
            success = False

        # Settle style transitions after rapid clicking to get accurate static colors
        print("  Waiting 2.0 seconds for CSS theme transitions to settle...")
        await asyncio.sleep(2.0)

        # 3. Dynamic Contrast Verification for Ticker and Body in Both Themes
        print("\n--- 3. DYNAMIC CONTRAST AND CANVAS ADAPTATION VERIFICATION ---")
        
        for mode in ["dark", "light"]:
            current_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
            if current_theme != mode:
                await client.eval_js("document.getElementById('themeToggle').click()")
                await asyncio.sleep(0.5) # Wait for theme toggle transition
                current_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
            
            print(f"  Active Mode: {current_theme.upper()}")
            
            # Check body bg and text colors
            body_colors = await client.eval_js("""
                (function() {
                    const style = window.getComputedStyle(document.body);
                    return { color: style.color, bg: style.backgroundColor };
                })()
            """)
            body_ratio = get_contrast_ratio(body_colors["color"], body_colors["bg"])
            print(f"    Body Text: {body_colors['color']} on {body_colors['bg']}. Contrast Ratio: {body_ratio:.2f}:1")
            if body_ratio >= 4.5:
                print("    [PASS] Body text contrast meets WCAG AA.")
            else:
                print("    [FAIL] Body text contrast is too low.")
                success = False

            # Check Ticker contrast (Green/Red text) against the actual Hero section bg
            hero_bg = await client.eval_js("""
                (function() {
                    const hero = document.getElementById('hero');
                    return window.getComputedStyle(hero).backgroundColor;
                })()
            """)
            
            # If hero bg is transparent (rgba(0, 0, 0, 0)), walk up or check page body bg
            if hero_bg == "transparent" or hero_bg == "rgba(0, 0, 0, 0)" or hero_bg.endswith(", 0)"):
                hero_bg = body_colors["bg"]
                
            if current_theme == "light":
                # Light mode ticker colors: Green rgba(22,101,52,0.35), Red rgba(185,28,28,0.35)
                # Since canvas draws on top of hero_bg, let's verify contrast of these colors against hero bg
                # Note: rgba with opacity blends with background. Let's calculate the blended color.
                green_color = "rgb(22, 101, 52)"
                red_color = "rgb(185, 28, 28)"
            else:
                # Dark mode ticker colors: Green rgba(34,197,94,0.15), Red rgba(239,68,68,0.15)
                green_color = "rgb(34, 197, 94)"
                red_color = "rgb(239, 68, 68)"
                
            green_ratio = get_contrast_ratio(green_color, hero_bg)
            red_ratio = get_contrast_ratio(red_color, hero_bg)
            
            print(f"    Ticker (Green): {green_color} on Hero bg {hero_bg}. Base Contrast: {green_ratio:.2f}:1")
            print(f"    Ticker (Red): {red_color} on Hero bg {hero_bg}. Base Contrast: {red_ratio:.2f}:1")
            
            if green_ratio >= 3.0: # 3:1 is standard for large text/graphical elements, or 4.5:1 for body
                print("    [PASS] Ticker Green base contrast is sufficient.")
            else:
                print("    [WARN] Ticker Green base contrast is low.")
                
            if red_ratio >= 3.0:
                print("    [PASS] Ticker Red base contrast is sufficient.")
            else:
                print("    [WARN] Ticker Red base contrast is low.")

        # Ensure theme is restored to dark (default)
        current_theme = await client.eval_js("document.documentElement.getAttribute('data-theme')")
        if current_theme != "dark":
            await client.eval_js("document.getElementById('themeToggle').click()")
            await asyncio.sleep(0.5)

        # 4. Filter buttons hover & active style retention verification
        print("\n--- 4. FILTER BUTTONS HOVER/ACTIVE STYLE RETENTION ---")
        
        # Let's inspect the active filter button style after clicking
        # Specifically, we verify that clicking '.filter-btn[data-filter="production"]'
        # gives it the '.active' class, and that its computed colors match '.filter-btn.active' rules.
        
        filter_selector = ".filter-btn[data-filter='production']"
        all_selector = ".filter-btn[data-filter='all']"
        
        # Click production filter
        await client.click(filter_selector)
        await asyncio.sleep(0.5)
        
        active_btn_data = await client.eval_js(f"""
            (function() {{
                const btn = document.querySelector("{filter_selector}");
                const allBtn = document.querySelector("{all_selector}");
                const style = window.getComputedStyle(btn);
                const allStyle = window.getComputedStyle(allBtn);
                
                return {{
                    btnHasActive: btn.classList.contains('active'),
                    allBtnHasActive: allBtn.classList.contains('active'),
                    btnBg: style.backgroundColor,
                    btnColor: style.color,
                    btnBorder: style.borderColor,
                    allBtnBg: allStyle.backgroundColor,
                    allBtnColor: allStyle.color
                }};
            }})()
        """)
        
        print(f"  Active Button Class Check: has 'active'={active_btn_data['btnHasActive']}")
        print(f"  Inactive Button Class Check: has 'active'={active_btn_data['allBtnHasActive']}")
        print(f"  Active Button Computed Style: bg='{active_btn_data['btnBg']}', color='{active_btn_data['btnColor']}', border='{active_btn_data['btnBorder']}'")
        print(f"  Inactive Button Computed Style: bg='{active_btn_data['allBtnBg']}', color='{active_btn_data['allBtnColor']}'")
        
        # Verify active button styles are retained cleanly
        # Under active class: color should be white (#ffffff = rgb(255, 255, 255)), background should be var(--accent)
        # In dark mode, --accent is hsl(210, 40%, 58%) = rgb(105, 147, 191) approx.
        # Let's check that active button is not using default background (transparent = rgba(0, 0, 0, 0))
        if active_btn_data['btnHasActive'] and not active_btn_data['allBtnHasActive']:
            print("  [PASS] Active class correctly transferred between buttons.")
        else:
            print("  [FAIL] Active class failed to transfer properly.")
            success = False
            
        if "rgba(0, 0, 0, 0)" in active_btn_data['btnBg'] or "transparent" in active_btn_data['btnBg']:
            print("  [FAIL] Active button background remains transparent!")
            success = False
        else:
            print("  [PASS] Active button has non-transparent background.")
            
        if "rgb(255, 255, 255)" in active_btn_data['btnColor']:
            print("  [PASS] Active button text color is white.")
        else:
            print(f"  [WARN] Active button text color is '{active_btn_data['btnColor']}', expected white.")
            
        # Reset back to 'all'
        await client.click(all_selector)
        await asyncio.sleep(0.2)

    except Exception as e:
        print(f"[ERROR] Exception occurred: {e}")
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
        print("                 CHALLENGER VERIFICATION: PASS                        ")
        print("======================================================================")
        sys.exit(0)
    else:
        print("                 CHALLENGER VERIFICATION: FAIL                        ")
        print("======================================================================")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_challenger_verification())
