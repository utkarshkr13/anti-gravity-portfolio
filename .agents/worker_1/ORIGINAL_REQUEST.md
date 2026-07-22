## 2026-06-15T22:57:15Z
Task: Set up E2E Test Infrastructure for the Portfolio website using pure Python, built-in libraries, and the `websockets` package.

Your workspace is d:\Utkarsh\Python\Side_Quest\Portfolio.
All test files must be created in a new directory: `d:\Utkarsh\Python\Side_Quest\Portfolio\tests\`.

Perform the following steps:
1. Locate Chrome or Edge executable on the Windows host. Check:
   - C:\Program Files\Google\Chrome\Application\chrome.exe
   - C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
   - C:\Program Files\Microsoft\Edge\Application\msedge.exe
   - C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
   If found, record the path. If multiple, prefer Edge or Chrome.

2. Create `tests/server.py` containing a lightweight Python HTTP server class or functions that serve the static files in the project root (`d:\Utkarsh\Python\Side_Quest\Portfolio`) on port 8000. It should run in a background thread or subprocess and have a cleanup mechanism to close the port.

3. Create `tests/cdp_client.py` containing a `CDPClient` class. It should:
   - Start the browser in headless mode with `--remote-debugging-port=9222 --disable-gpu` (and optionally `--headless=new` or `--headless`).
   - Use the `websockets` library (which is already installed in the environment) to connect to the CDP debugging URL. (Query http://localhost:9222/json/list to get the WebSocket debugger URL).
   - Provide helper methods:
     - `navigate(url)`: Navigates to a page and waits for load.
     - `eval_js(script)`: Runs a JavaScript snippet via CDP `Runtime.evaluate` and returns the resulting value.
     - `set_viewport(width, height)`: Resizes viewport via CDP `Emulation.setDeviceMetricsOverride`.
     - `take_screenshot(output_path)`: Captures page screenshot via CDP `Page.captureScreenshot` and saves as PNG.
     - `get_box_model(selector)`: Gets the layout bounding box of a DOM element.
     - `click(selector)`: Triggers a click on a selector (either by sending mouse event or executing JS click()).
     - `close()`: Closes the websocket connection and kills the browser process cleanly.

4. Create a basic test runner `tests/run_tests.py` that:
   - Launches the HTTP test server on port 8000.
   - Starts the headless browser.
   - Navigates to http://localhost:8000/index.html.
   - Runs a basic test (e.g. checks that the page title matches or a key element exists).
   - Prints clean, structured logs.
   - Shuts down the browser and server cleanly.

Verify that your infrastructure runs and can connect to the page by running `python tests/run_tests.py`. Provide the console output in your handoff report.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
