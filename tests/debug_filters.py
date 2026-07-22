import asyncio
import os
import sys

# Add project root and tests folder to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import start_server, stop_server
from cdp_client import CDPClient

async def debug_filters():
    server = start_server(8008)
    client = CDPClient(port=9231)
    await client.start()
    
    try:
        await client.navigate("http://localhost:8008/index.html")
        
        # Wait for page loader
        print("Waiting for page loader to dismiss...")
        for _ in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
            
        print("Page loaded successfully.")
        
        # Log initial card styles
        cards_info = await client.eval_js("""
            (function() {
                return Array.from(document.querySelectorAll('.project-card')).map(card => ({
                    title: card.querySelector('.project-card-title') ? card.querySelector('.project-card-title').innerText : 'No Title',
                    category: card.getAttribute('data-category'),
                    style_display: card.style.display,
                    computed_display: window.getComputedStyle(card).display
                }));
            })()
        """)
        print("\n--- Initial Card States ---")
        for idx, info in enumerate(cards_info):
            print(f"Card {idx+1}: '{info['title']}' | Category: '{info['category']}' | style.display: '{info['style_display']}' | computed display: '{info['computed_display']}'")

        # Clicks filter buttons and records display states
        filters = ["all", "production", "fullstack", "analytics"]
        for filt in filters:
            print(f"\n--- Clicking filter: '{filt}' ---")
            await client.click(f".filter-btn[data-filter='{filt}']")
            await asyncio.sleep(1.2) # Wait for animation
            
            cards_info = await client.eval_js("""
                (function() {
                    return Array.from(document.querySelectorAll('.project-card')).map(card => ({
                        title: card.querySelector('.project-card-title') ? card.querySelector('.project-card-title').innerText : 'No Title',
                        category: card.getAttribute('data-category'),
                        style_display: card.style.display,
                        computed_display: window.getComputedStyle(card).display
                    }));
                })()
            """)
            for idx, info in enumerate(cards_info):
                print(f"  Card {idx+1}: '{info['title']}' | Category: '{info['category']}' | style.display: '{info['style_display']}' | computed display: '{info['computed_display']}'")
                
    except Exception as e:
        print("Exception:", e)
    finally:
        await client.close()
        stop_server(server)

if __name__ == "__main__":
    asyncio.run(debug_filters())
