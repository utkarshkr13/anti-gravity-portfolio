import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import start_server, stop_server
from cdp_client import CDPClient

async def debug():
    server = start_server(8006)
    client = CDPClient(port=9229)
    await client.start()
    
    try:
        await client.navigate("http://localhost:8006/index.html")
        print("[DEBUG SCROLL] Waiting for page loader...")
        for _ in range(80):
            is_loader_gone = await client.eval_js(
                "document.getElementById('pageLoader') ? document.getElementById('pageLoader').style.display === 'none' : true"
            )
            if is_loader_gone:
                break
            await asyncio.sleep(0.1)
            
        print("[DEBUG SCROLL] Evaluating window.scrollTo(0, 800)")
        res = await client.eval_js("window.scrollTo(0, 800); 'ok'")
        print("[DEBUG SCROLL] Result:", res)
        
        await asyncio.sleep(1.0)
        scroll_y = await client.eval_js("window.scrollY")
        print("[DEBUG SCROLL] Current scrollY:", scroll_y)
        
    except Exception as e:
        print("[DEBUG SCROLL] Exception:", e)
    finally:
        await client.close()
        stop_server(server)

if __name__ == "__main__":
    asyncio.run(debug())
