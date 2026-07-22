import asyncio
import traceback
import sys

async def debug():
    try:
        from tests.server import start_server, stop_server
        from tests.cdp_client import CDPClient
    except Exception as e:
        with open("debug_modal_err.txt", "w") as f:
            f.write(f"Import error: {e}\n")
            traceback.print_exc(file=f)
        sys.exit(1)
        
    server = None
    client = None
    try:
        try:
            server = start_server(8000)
        except Exception as e:
            with open("debug_modal_err.txt", "w") as f:
                f.write(f"Server start error: {e}\n")
            # Maybe server is already running, try to connect anyway
            pass

        client = CDPClient(port=9225)
        await client.start()
        await client.navigate("http://localhost:8000/index.html")
        await asyncio.sleep(4.0)
        
        # Open modal
        print("\n--- Opening modal ---")
        await client.click(".btn-case-study[data-project='sap-tracker']")
        await asyncio.sleep(0.8)
        
        modal_visible = await client.eval_js("window.getComputedStyle(document.getElementById('projectModal')).display")
        print(f"Modal display after open: {modal_visible}")
        
        # Close modal
        print("\n--- Closing modal ---")
        await client.click("#modalCloseBtn")
        
        for delay in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]:
            await asyncio.sleep(0.1)
            display = await client.eval_js("window.getComputedStyle(document.getElementById('projectModal')).display")
            opacity = await client.eval_js("window.getComputedStyle(document.getElementById('projectModal')).opacity")
            wrapper_opacity = await client.eval_js("window.getComputedStyle(document.querySelector('.modal-wrapper')).opacity")
            print(f"Delay {delay:.1f}s | display: {display} | opacity: {opacity} | wrapper opacity: {wrapper_opacity}")
            
    except Exception as e:
        with open("debug_modal_err.txt", "w") as f:
            f.write(f"Runtime error: {e}\n")
            traceback.print_exc(file=f)
    finally:
        if client:
            try:
                await client.close()
            except:
                pass
        if server:
            try:
                stop_server(server)
            except:
                pass

if __name__ == '__main__':
    asyncio.run(debug())
