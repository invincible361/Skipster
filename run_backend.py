#!/usr/bin/env python3
"""
Startup script for the Academic Attendance Tracker Backend
"""

import os
import sys
import uvicorn
from pathlib import Path

def main():
    # Add the backend directory to Python path
    backend_dir = Path(__file__).parent / "backend"
    sys.path.insert(0, str(backend_dir))
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv("config.env")
    
    # Check if required API keys are set
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if not openai_key and not gemini_key:
        print("⚠️  Warning: No OpenAI or Gemini API key found!")
        print("Please set OPENAI_API_KEY or GEMINI_API_KEY in config.env for AI features")
        print("The application will work with basic PDF processing only.")
        print()
    elif openai_key:
        print("✅ OpenAI API key found - AI features enabled")
        print()
    elif gemini_key:
        print("✅ Gemini API key found - AI features enabled")
        print()
    
    # Create uploads directory if it doesn't exist
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    
    # Start the server
    print("🚀 Starting Academic Attendance Tracker Backend...")
    print("📁 Upload directory:", uploads_dir.absolute())
    print("🌐 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print()
    
    try:
        uvicorn.run(
            "backend.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 