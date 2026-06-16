import os
import sys
import json
import time
import asyncio
import subprocess
import tempfile
import urllib.request
import base64
import websockets

def find_browser():
    """Locate Chrome or Edge executable on the Windows host."""
    paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    ]
    for path in paths:
        if os.path.exists(path):
            return path
    return None

class CDPClient:
    def __init__(self, browser_path=None, port=9222):
        self.browser_path = browser_path or find_browser()
        if not self.browser_path:
            raise RuntimeError("Could not find Google Chrome or Microsoft Edge executable on the host system.")
        self.port = port
        self.process = None
        self.websocket = None
        self.temp_dir = None
        self.next_id = 0
        self.pending_responses = {}
        self.listener_task = None
        self.load_event_future = None

    async def start(self):
        """Starts the browser process and connects the websocket."""
        print(f"[CDP CLIENT] Using browser executable: {self.browser_path}")
        self.temp_dir = tempfile.TemporaryDirectory()
        
        # Launch browser in headless mode with remote debugging enabled
        cmd = [
            self.browser_path,
            "--headless=new",
            f"--remote-debugging-port={self.port}",
            "--disable-gpu",
            f"--user-data-dir={self.temp_dir.name}",
            "about:blank"
        ]
        
        # Start browser in background process
        self.process = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Query http://localhost:9222/json/list to get the WebSocket debugger URL
        url = f"http://localhost:{self.port}/json/list"
        ws_url = None
        
        # Retry querying the browser JSON endpoint for up to 5 seconds
        for _ in range(50):
            try:
                with urllib.request.urlopen(url, timeout=1) as response:
                    if response.status == 200:
                        targets = json.loads(response.read().decode())
                        # Look for target of type "page"
                        for target in targets:
                            if target.get("type") == "page" and "webSocketDebuggerUrl" in target:
                                ws_url = target["webSocketDebuggerUrl"]
                                break
                        if ws_url:
                            break
            except Exception:
                pass
            await asyncio.sleep(0.1)
            
        if not ws_url:
            self.close_sync()
            raise RuntimeError(f"Failed to connect to browser on port {self.port} or retrieve WebSocket URL.")

        print(f"[CDP CLIENT] Connecting to websocket URL: {ws_url}")
        self.websocket = await websockets.connect(ws_url)
        
        # Start background listener task to process incoming CDP messages
        self.listener_task = asyncio.create_task(self._listen())
        
        # Enable runtime and page domains
        await self.send_cmd("Runtime.enable")
        await self.send_cmd("Page.enable")
        print("[CDP CLIENT] Browser started and CDP session initialized.")

    async def _listen(self):
        """Internal background listener for processing WebSocket messages."""
        try:
            async for message in self.websocket:
                data = json.loads(message)
                msg_id = data.get("id")
                if msg_id is not None:
                    future = self.pending_responses.pop(msg_id, None)
                    if future and not future.done():
                        future.set_result(data)
                else:
                    # Parse event
                    method = data.get("method")
                    if method == "Page.loadEventFired":
                        if self.load_event_future and not self.load_event_future.done():
                            self.load_event_future.set_result(True)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"[CDP CLIENT ERROR] Listener task failed: {e}")

    async def send_cmd(self, method, params=None):
        """Sends a CDP command and waits for the response."""
        self.next_id += 1
        cmd_id = self.next_id
        payload = {
            "id": cmd_id,
            "method": method,
            "params": params or {}
        }
        
        loop = asyncio.get_running_loop()
        future = loop.create_future()
        self.pending_responses[cmd_id] = future
        
        await self.websocket.send(json.dumps(payload))
        
        response = await future
        if "error" in response:
            raise Exception(f"CDP Command '{method}' failed: {response['error']}")
        return response.get("result")

    async def navigate(self, url):
        """Navigates to a page and waits for load."""
        loop = asyncio.get_running_loop()
        self.load_event_future = loop.create_future()
        
        print(f"[CDP CLIENT] Navigating to: {url}")
        await self.send_cmd("Page.navigate", {"url": url})
        
        # Wait for Page.loadEventFired with a timeout of 10 seconds
        try:
            await asyncio.wait_for(self.load_event_future, timeout=10.0)
            print("[CDP CLIENT] Page navigation complete (load event fired).")
        except asyncio.TimeoutError:
            print("[CDP CLIENT] Warning: Navigation wait timed out, continuing anyway.")
        finally:
            self.load_event_future = None

    async def eval_js(self, script):
        """Runs a JavaScript snippet via CDP Runtime.evaluate and returns the resulting value."""
        res = await self.send_cmd("Runtime.evaluate", {
            "expression": script,
            "returnByValue": True
        })
        if "exceptionDetails" in res:
            exception = res["exceptionDetails"]
            text = exception.get("exception", {}).get("description", "JS Error")
            raise Exception(f"JavaScript evaluation failed: {text}")
        return res.get("result", {}).get("value")

    async def set_viewport(self, width, height):
        """Resizes viewport via CDP Emulation.setDeviceMetricsOverride."""
        print(f"[CDP CLIENT] Resizing viewport to {width}x{height}")
        await self.send_cmd("Emulation.setDeviceMetricsOverride", {
            "width": int(width),
            "height": int(height),
            "deviceScaleFactor": 1,
            "mobile": False
        })

    async def take_screenshot(self, output_path):
        """Captures page screenshot via CDP Page.captureScreenshot and saves as PNG."""
        print(f"[CDP CLIENT] Capturing screenshot...")
        res = await self.send_cmd("Page.captureScreenshot", {"format": "png"})
        img_data = base64.b64decode(res["data"])
        
        # Ensure output directory exists
        dir_name = os.path.dirname(output_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
            
        with open(output_path, "wb") as f:
            f.write(img_data)
        print(f"[CDP CLIENT] Screenshot saved to: {output_path}")

    async def get_box_model(self, selector):
        """Gets the layout bounding box of a DOM element."""
        await self.send_cmd("DOM.enable")
        doc = await self.send_cmd("DOM.getDocument")
        root_node_id = doc["root"]["nodeId"]
        
        try:
            res = await self.send_cmd("DOM.querySelector", {
                "nodeId": root_node_id,
                "selector": selector
            })
            node_id = res["nodeId"]
            if node_id == 0:
                print(f"[CDP CLIENT] Element not found for selector: {selector}")
                return None
            
            box = await self.send_cmd("DOM.getBoxModel", {"nodeId": node_id})
            return box.get("model")
        except Exception as e:
            print(f"[CDP CLIENT] Failed to get box model for '{selector}': {e}")
            return None

    async def click(self, selector):
        """Triggers a click on a selector (either by sending mouse event or executing JS click())."""
        # Escape quotes in selector for JS evaluations
        selector_escaped = selector.replace('"', '\\"')
        
        # Scroll into view first
        try:
            await self.eval_js(f'const el = document.querySelector("{selector_escaped}"); if (el) el.scrollIntoView({{block: "center", inline: "center"}});')
            await asyncio.sleep(0.2)
        except Exception:
            pass

        # Get viewport metrics
        viewport_width = 1280
        viewport_height = 800
        try:
            val = await self.eval_js("({width: window.innerWidth, height: window.innerHeight})")
            if isinstance(val, dict):
                viewport_width = val.get("width", 1280)
                viewport_height = val.get("height", 800)
        except Exception:
            pass

        model = await self.get_box_model(selector)
        if model:
            # content coordinates form a polygon points array [x0, y0, x1, y1, x2, y2, x3, y3]
            content = model["content"]
            # Find center of content box
            x = (content[0] + content[2] + content[4] + content[6]) / 4
            y = (content[1] + content[3] + content[5] + content[7]) / 4
            
            # Check if coordinates are within viewport
            if 0 <= x <= viewport_width and 0 <= y <= viewport_height:
                # Send MousePressed and MouseReleased
                await self.send_cmd("Input.dispatchMouseEvent", {
                    "type": "mousePressed",
                    "x": x,
                    "y": y,
                    "button": "left",
                    "clickCount": 1
                })
                await self.send_cmd("Input.dispatchMouseEvent", {
                    "type": "mouseReleased",
                    "x": x,
                    "y": y,
                    "button": "left",
                    "clickCount": 1
                })
                print(f"[CDP CLIENT] Clicked '{selector}' via mouse event at coordinates ({x:.2f}, {y:.2f})")
                return
            else:
                print(f"[CDP CLIENT] Coordinates ({x:.2f}, {y:.2f}) out of viewport ({viewport_width}x{viewport_height}), falling back to JS click.")
        
        # Fallback to executing JS click()
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
        success = await self.eval_js(script)
        if not success:
            raise Exception(f"Element not found for click: {selector}")
        print(f"[CDP CLIENT] Clicked '{selector}' via JS click fallback")

    async def close(self):
        """Closes the websocket connection and kills the browser process cleanly."""
        print("[CDP CLIENT] Shutting down CDP client...")
        if self.listener_task:
            self.listener_task.cancel()
            try:
                await self.listener_task
            except Exception:
                pass
                
        if self.websocket:
            try:
                await self.websocket.close()
            except Exception:
                pass
                
        self.close_sync()

    def close_sync(self):
        """Sync component of close for cleanup during startup failure."""
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=3)
            except Exception:
                try:
                    self.process.kill()
                except Exception:
                    pass
            self.process = None
            
        if self.temp_dir:
            try:
                self.temp_dir.cleanup()
            except Exception:
                pass
            self.temp_dir = None
        print("[CDP CLIENT] Browser process terminated.")
