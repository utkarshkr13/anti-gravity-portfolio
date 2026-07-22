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
        
        layout = await client.eval_js("""
            Array.from(document.querySelectorAll('section, .nav-wrapper')).map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    id: el.id || el.className,
                    top: rect.top + window.scrollY,
                    height: rect.height,
                    display: window.getComputedStyle(el).display,
                    visibility: window.getComputedStyle(el).visibility
                };
            })
        """)
        print("Layout elements:")
        for el in layout:
            print(f"  {el['id']}: top={el['top']}px, height={el['height']}px, display={el['display']}, visibility={el['visibility']}")
            
    finally:
        await client.close()
        stop_server(server)

if __name__ == '__main__':
    asyncio.run(debug())
