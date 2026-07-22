import asyncio
import os
import sys

# Add the project root and tests directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import start_server, stop_server
from cdp_client import CDPClient

async def inspect():
    server = start_server(8006)
    client = CDPClient(port=9229)
    await client.start()
    
    try:
        await client.navigate("http://localhost:8006/index.html")
        
        # Wait for page loader to disappear
        for _ in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        
        filters = ["all", "production", "fullstack", "analytics"]
        for filt in filters:
            print(f"\n--- Clicking filter: {filt} ---")
            await client.click(f".filter-btn[data-filter='{filt}']")
            await asyncio.sleep(1.2) # Wait for Flip transition
            
            states = await client.eval_js("""
                Array.from(document.querySelectorAll('.project-card')).map(card => {
                    return {
                        category: card.getAttribute('data-category'),
                        display: window.getComputedStyle(card).display,
                        style_display: card.style.display
                    };
                })
            """)
            
            for idx, state in enumerate(states):
                print(f"  Card {idx} ({state['category']}): computed display='{state['display']}', style.display='{state['style_display']}'")
                
    finally:
        await client.close()
        stop_server(server)

if __name__ == "__main__":
    asyncio.run(inspect())
