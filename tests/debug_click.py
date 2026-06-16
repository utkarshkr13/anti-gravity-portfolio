import asyncio
import os
import sys

sys.path.append(r"d:\Utkarsh\Python\Side_Quest\Portfolio")
sys.path.append(r"d:\Utkarsh\Python\Side_Quest\Portfolio\tests")

from server import start_server, stop_server
from cdp_client import CDPClient

async def main():
    server = start_server(8002)
    client = CDPClient(port=9224)
    await client.start()
    try:
        await client.navigate("http://localhost:8002/index.html")
        await asyncio.sleep(2)
        
        # Test scroll and click
        selector = ".filter-btn[data-filter='production']"
        selector_escaped = selector.replace('"', '\\"')
        print("selector_escaped:", repr(selector_escaped))
        
        script = f"""
        (function() {{
            const el = document.querySelector("{selector_escaped}");
            if (el) {{
                el.click();
                return true;
            }}
            return false;
        }})()
        """
        print("Script expression:")
        print(script)
        
        res = await client.send_cmd("Runtime.evaluate", {
            "expression": script,
            "returnByValue": True
        })
        print("Runtime.evaluate result:", res)
    finally:
        await client.close()
        stop_server(server)

if __name__ == "__main__":
    asyncio.run(main())
