import asyncio
from tests.server import start_server, stop_server
from tests.cdp_client import CDPClient

async def debug():
    server = start_server(8000)
    client = CDPClient(port=9225)
    await client.start()
    try:
        await client.navigate("http://localhost:8000/index.html")
        await asyncio.sleep(4.0) # wait for page loader to disappear
        
        # Test category filtering
        # First click all, then production, then fullstack
        for filt in ["all", "production"]:
            await client.click(f".filter-btn[data-filter='{filt}']")
            await asyncio.sleep(0.6)
            
        print("\n--- Clicking fullstack filter ---")
        await client.click(".filter-btn[data-filter='fullstack']")
        
        for delay in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]:
            await asyncio.sleep(0.1)
            card_states = await client.eval_js("""
                Array.from(document.querySelectorAll('.project-card')).map(c => ({
                    title: c.querySelector('.project-card-title').innerText,
                    display: window.getComputedStyle(c).display
                }))
            """)
            print(f"Delay {delay:.1f}s:")
            for idx, c in enumerate(card_states):
                print(f"  Card {idx+1}: {c['title']} | display: {c['display']}")
                
    finally:
        await client.close()
        stop_server(server)

if __name__ == '__main__':
    asyncio.run(debug())
