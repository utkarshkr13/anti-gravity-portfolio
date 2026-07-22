import asyncio
import traceback
import sys

def log(msg):
    with open("step_log.txt", "a") as f:
        f.write(msg + "\n")
    print(msg, flush=True)

async def debug():
    log("Starting debug function...")
    try:
        from tests.server import start_server, stop_server
        from tests.cdp_client import CDPClient
        log("Imports successful.")
    except Exception as e:
        log(f"Import error: {e}")
        with open("debug_modal_err.txt", "w") as f:
            traceback.print_exc(file=f)
        return

    server = None
    client = None
    try:
        log("Starting server...")
        try:
            server = start_server(8000)
            log("Server started on port 8000.")
        except Exception as e:
            log(f"Server start warning (might be already running): {e}")

        log("Starting CDP Client on port 9225...")
        client = CDPClient(port=9225)
        await client.start()
        log("CDP Client started.")

        log("Navigating to index.html...")
        await client.navigate("http://localhost:8000/index.html")
        log("Navigation complete. Waiting 4 seconds...")
        await asyncio.sleep(4.0)

        log("Opening modal...")
        await client.click(".btn-case-study[data-project='sap-tracker']")
        log("Click on case study complete. Waiting 0.8s...")
        await asyncio.sleep(0.8)

        modal_visible = await client.eval_js("window.getComputedStyle(document.getElementById('projectModal')).display")
        log(f"Modal display: {modal_visible}")

        log("Closing modal...")
        await client.click("#modalCloseBtn")
        log("Click on close button complete.")

        for i in range(1, 9):
            await asyncio.sleep(0.1)
            display = await client.eval_js("window.getComputedStyle(document.getElementById('projectModal')).display")
            opacity = await client.eval_js("window.getComputedStyle(document.getElementById('projectModal')).opacity")
            wrapper_opacity = await client.eval_js("window.getComputedStyle(document.querySelector('.modal-wrapper')).opacity")
            log(f"Delay {i*0.1:.1f}s | display: {display} | opacity: {opacity} | wrapper opacity: {wrapper_opacity}")

    except BaseException as e:
        log(f"Caught BaseException: {type(e).__name__} - {e}")
        with open("debug_modal_err.txt", "w") as f:
            f.write(f"Exception type: {type(e).__name__}\n")
            traceback.print_exc(file=f)
    finally:
        log("Cleaning up...")
        if client:
            try:
                await client.close()
                log("CDP client closed.")
            except Exception as e:
                log(f"Error closing client: {e}")
        if server:
            try:
                stop_server(server)
                log("Server stopped.")
            except Exception as e:
                log(f"Error stopping server: {e}")
        log("Cleanup finished.")

if __name__ == '__main__':
    # Clear step log
    with open("step_log.txt", "w") as f:
        f.write("=== LOG START ===\n")
    try:
        asyncio.run(debug())
    except BaseException as e:
        log(f"Fatal exception in asyncio.run: {e}")
