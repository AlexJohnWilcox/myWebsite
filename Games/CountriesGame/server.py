#!/usr/bin/env python3
"""
Countries Game — pure stdlib server.
Uses http.server + sqlite3.  No third-party packages required.

Usage:  python3 server.py
Then open  http://localhost:3000
"""

import json
import os
import sqlite3
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse

PORT       = 3000
PUBLIC_DIR = Path(__file__).parent / "public"
DB_PATH    = Path(__file__).parent / "sessions.db"

# ── Database ──────────────────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now','localtime')),
                end_time   TEXT,
                completed  INTEGER NOT NULL DEFAULT 0,
                gave_up    INTEGER NOT NULL DEFAULT 0,
                total      INTEGER NOT NULL DEFAULT 198,
                guessed    INTEGER NOT NULL DEFAULT 0,
                missed     TEXT    NOT NULL DEFAULT '[]',
                seconds    INTEGER NOT NULL DEFAULT 0
            )
        """)

# ── MIME types ────────────────────────────────────────────────────────────
MIME = {
    ".html": "text/html; charset=utf-8",
    ".css":  "text/css; charset=utf-8",
    ".js":   "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png":  "image/png",
    ".ico":  "image/x-icon",
    ".svg":  "image/svg+xml",
}

# ── Request handler ───────────────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} {fmt % args}")

    # helpers ──────────────────────────────────────────────────────────────
    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def serve_file(self, path: Path):
        if not path.is_file():
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")
            return
        suffix = path.suffix.lower()
        mime   = MIME.get(suffix, "application/octet-stream")
        data   = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    # GET ──────────────────────────────────────────────────────────────────
    def do_GET(self):
        parsed = urlparse(self.path)
        p      = parsed.path.rstrip("/")

        # API
        if p == "/api/sessions":
            with get_db() as conn:
                rows = conn.execute(
                    "SELECT * FROM sessions ORDER BY id DESC LIMIT 50"
                ).fetchall()
            result = []
            for r in rows:
                d = dict(r)
                d["missed"]    = json.loads(d["missed"])
                d["completed"] = bool(d["completed"])
                d["gave_up"]   = bool(d["gave_up"])
                result.append(d)
            self.send_json(result)
            return

        # Static files
        rel = p.lstrip("/") or "index.html"
        self.serve_file(PUBLIC_DIR / rel)

    # POST ─────────────────────────────────────────────────────────────────
    def do_POST(self):
        parsed = urlparse(self.path)
        p      = parsed.path

        if p == "/api/win":
            body = self.read_body()
            now  = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            with get_db() as conn:
                conn.execute(
                    "INSERT INTO sessions (start_time, end_time, completed, guessed, total, seconds) "
                    "VALUES (?,?,1,197,197,?)",
                    (now, now, body.get("seconds", 0))
                )
            self.send_json({"ok": True})
            return

        self.send_json({"error": "not found"}, 404)

    # DELETE ────────────────────────────────────────────────────────────────
    def do_DELETE(self):
        parsed = urlparse(self.path)
        p      = parsed.path.rstrip("/")

        # DELETE /api/sessions  — wipe every row
        if p == "/api/sessions":
            with get_db() as conn:
                conn.execute("DELETE FROM sessions")
            self.send_json({"ok": True})
            return

        # DELETE /api/session/<id>  — single row
        if p.startswith("/api/session/"):
            try:
                sid = int(p.split("/")[-1])
            except ValueError:
                self.send_json({"error": "invalid id"}, 400)
                return
            with get_db() as conn:
                conn.execute("DELETE FROM sessions WHERE id = ?", (sid,))
            self.send_json({"ok": True})
            return

        self.send_json({"error": "not found"}, 404)

# ── Main ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    server = HTTPServer(("", PORT), Handler)
    print(f"Countries Game  →  http://localhost:{PORT}")
    print("Press Ctrl+C to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()
