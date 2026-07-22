import asyncio
import os
import sys

# Add the project root and tests directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import start_server, stop_server
from cdp_client import CDPClient

async def inspect():
    server = start_server(8005)
    client = CDPClient(port=9228)
    await client.start()
    
    try:
        await client.navigate("http://localhost:8005/index.html")
        
        # Wait for page loader to disappear
        print("[INSPECT] Waiting for page loader...")
        for _ in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
        
        # Print initial states
        initial_states = await client.eval_js("""
            Array.from(document.querySelectorAll('.project-card')).map(card => {
                return {
                    category: card.getAttribute('data-category'),
                    display: window.getComputedStyle(card).display,
                    class: card.className
                };
            })
        """)
        print("\n[INSPECT] Initial states:")
        for idx, state in enumerate(initial_states):
            print(f"  Card {idx}: category={state['category']}, display={state['display']}, class={state['class']}")
            
        # Click the filter button for 'production'
        print("\n[INSPECT] Clicking '.filter-btn[data-filter=\"production\"]'")
        await client.click(".filter-btn[data-filter='production']")
        
        # Wait 1.0s
        await asyncio.sleep(1.0)
        
        # Print states after click
        after_states = await client.eval_js("""
            Array.from(document.querySelectorAll('.project-card')).map(card => {
                return {
                    category: card.getAttribute('data-category'),
                    display: window.getComputedStyle(card).display,
                    class: card.className
                };
            })
        """)
        
        btn_states = await client.eval_js("""
            Array.from(document.querySelectorAll('.filter-btn')).map(btn => {
                return {
                    filter: btn.getAttribute('data-filter'),
                    class: btn.className
                };
            })
        """)
        
        print("\n[INSPECT] Button states:")
        for btn in btn_states:
            print(f"  Button filter={btn['filter']}, class={btn['class']}")
            
        print("\n[INSPECT] States after filtering:")
        for idx, state in enumerate(after_states):
            print(f"  Card {idx}: category={state['category']}, display={state['display']}, class={state['class']}")
            
    finally:
        await client.close()
        stop_server(server)

if __name__ == "__main__":
    asyncio.run(inspect())
