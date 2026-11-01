"""Local preview server for the LogiQ Fiki.

Python's built-in `python3 -m http.server` ignores HTTP Range requests and serves
.m4a as audio/mp4a-latm, so Safari (and other AVFoundation-based players) refuse
to play the interview recordings. This server adds Range support and the
audio/mp4 type, matching how GitHub Pages serves the site.

Usage: python3 serve.py [port]   (default 8000), then open http://localhost:8000/
"""
import http.server
import os
import re
import sys


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.m4a': 'audio/mp4'}

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        self._range_length = None
        path = self.translate_path(self.path)
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', self.headers.get('Range', '').strip())
        if not match or not os.path.isfile(path) or match.groups() == ('', ''):
            return super().send_head()

        size = os.path.getsize(path)
        first, last = match.groups()
        if first:
            start, end = int(first), min(int(last), size - 1) if last else size - 1
        else:
            start, end = max(size - int(last), 0), size - 1
        if start >= size or start > end:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.end_headers()
            return None

        file = open(path, 'rb')
        file.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        self._range_length = end - start + 1
        return file

    def copyfile(self, source, outputfile):
        if self._range_length is None:
            return super().copyfile(source, outputfile)
        remaining = self._range_length
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'Serving the LogiQ Fiki at http://localhost:{port}/ (Ctrl+C to stop)')
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
