"""Local preview server.

Python's stock http.server sends no cache headers, so a browser is free to keep serving
its own copy of a data or code file long after the file on disk has changed — the failure
mode is a change that shows up in one language, one page, or not at all, and looks like a
data bug. This sends no-store on everything, so a plain reload is always enough.

    python serve.py [port]        # default 8792
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8792
    print(f"BakeStack preview: http://localhost:{port}/  (no-cache, Ctrl+C to stop)")
    ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
