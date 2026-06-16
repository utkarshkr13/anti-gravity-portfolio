import http.server
import threading
import os
import time

class PortfolioTCPServer(http.server.HTTPServer):
    allow_reuse_address = True

class PortfolioHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # The directory to serve is set on the class or passed in kwargs
        # We will override kwargs to point to the portfolio root
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        super().__init__(*args, directory=project_root, **kwargs)

    def log_message(self, format, *args):
        # We can customize request logging or suppress it to keep test output clean.
        # Let's print requests with a prefix for visibility in debug logs.
        print(f"[HTTP SERVER] {self.address_string()} - - [{self.log_date_time_string()}] {format % args}")

def start_server(port=8000):
    """Starts the HTTP server in a background thread and returns the server instance."""
    server = PortfolioTCPServer(("", port), PortfolioHTTPRequestHandler)
    
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    
    # Wait briefly for the server to be ready
    time.sleep(0.5)
    print(f"[HTTP SERVER] Started serving portfolio files on port {port}")
    return server

def stop_server(server):
    """Cleanly shuts down the HTTP server."""
    if server:
        print("[HTTP SERVER] Shutting down HTTP server...")
        server.shutdown()
        server.server_close()
        print("[HTTP SERVER] HTTP server stopped.")
