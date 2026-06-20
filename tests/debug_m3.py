import asyncio
import os
import sys

# Add the current directory (tests) to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import start_server, stop_server
from cdp_client import CDPClient

async def debug_dom():
    server = start_server(8000)
    client = CDPClient(port=9225)
    await client.start()
    
    try:
        await client.navigate("http://localhost:8000/index.html")
        await asyncio.sleep(1.0)
        
        # Print HTML of filter container
        html = await client.eval_js("document.querySelector('#projects') ? document.querySelector('#projects').innerHTML : 'No #projects'")
        print("--- Projects innerHTML length ---")
        print(len(html))
        
        # Check if filter buttons exist
        btns = await client.eval_js("""
            Array.from(document.querySelectorAll('.filter-btn')).map(b => ({
                tag: b.tagName,
                text: b.innerText,
                filter: b.getAttribute('data-filter')
            }))
        """)
        print("--- Filter buttons ---")
        print(btns)
        
        # Get url
        url = await client.eval_js("window.location.href")
        print("--- Current URL ---")
        print(url)
        
    finally:
        await client.close()
        stop_server(server)

if __name__ == "__main__":
    asyncio.run(debug_dom())
