#!/usr/bin/env python3
"""
Startup script for the Academic Attendance Tracker Backend
"""

import os
import uvicorn
from pathlib import Path

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Get port from environment variable (Render sets PORT)
port = int(os.environ.get("PORT", 8000))

# Get host from environment variable
host = os.environ.get("HOST", "0.0.0.0")

if __name__ == "__main__":
    print("✅ OpenAI API key found - AI features enabled" if os.getenv("OPENAI_API_KEY") else "⚠️  OpenAI API key not found - AI features disabled")
    print("🚀 Starting Academic Attendance Tracker Backend...")
    print(f"📁 Upload directory: {uploads_dir.absolute()}")
    print(f"🌐 Server will be available at: http://{host}:{port}")
    print("📚 API documentation at: http://localhost:8000/docs")
    
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=True
    ) 