import asyncio
import os
import sys

sys.path.append(r"d:\Utkarsh\Python\Side_Quest\Portfolio")
sys.path.append(r"d:\Utkarsh\Python\Side_Quest\Portfolio\tests")

from server import start_server, stop_server
from cdp_client import CDPClient

async def main():
    server = start_server(8003)
    client = CDPClient(port=9226)
    await client.start()
    try:
        await client.navigate("http://localhost:8003/index.html")
        await asyncio.sleep(2)
        
        # Set viewport to mobile
        await client.set_viewport(375, 812)
        await asyncio.sleep(0.5)
        
        # Print initial lenis state
        state_before = await client.eval_js("window.lenis ? { isStopped: window.lenis.isStopped } : null")
        print("Before stop:", state_before)
        
        # Click modal button
        await client.click(".btn-case-study[data-project='sap-tracker']")
        await asyncio.sleep(0.5)
        
        # Print lenis state after stop
        state_after = await client.eval_js("window.lenis ? { isStopped: window.lenis.isStopped } : null")
        print("After stop:", state_after)
        
        # Print all window.lenis properties
        keys = await client.eval_js("window.lenis ? Object.keys(window.lenis) : []")
        print("Lenis keys:", keys)
        
    finally:
        await client.close()
        stop_server(server)

if __name__ == "__main__":
    asyncio.run(main())
