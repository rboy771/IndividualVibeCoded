"""
Runner script for VibeTracker FastAPI server.
Usage:
    python backend/run.py
"""

import sys
import uvicorn

if __name__ == "__main__":
    port = 8000
    host = "127.0.0.1"
    print(f"Starting VibeTracker FastAPI backend on http://{host}:{port} ...")
    uvicorn.run("main:app", host=host, port=port, reload=False, app_dir="backend")
