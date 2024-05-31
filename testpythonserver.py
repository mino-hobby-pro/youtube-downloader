# this python script only exists for me to test the website before commiting to github.

import http.server
import socketserver
import os

class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if not os.path.splitext(self.path)[1] and os.path.exists(self.translate_path(self.path) + '.html'):
            self.path += '.html'
        return super().do_GET()

PORT = 8000

Handler = CustomRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
