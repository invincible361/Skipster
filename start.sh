#!/bin/bash

echo "🎓 Academic Attendance Tracker with AI-Powered PDF Processing"
echo "================================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check your Python installation."
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""

# Check for API keys
if [ ! -f "config.env" ]; then
    echo "⚠️  No config.env file found. Creating one..."
    cp config.env config.env.backup 2>/dev/null || echo "# API Keys for AI Services" > config.env
    echo "OPENAI_API_KEY=your_openai_api_key_here" >> config.env
    echo "HOST=0.0.0.0" >> config.env
    echo "PORT=8000" >> config.env
    echo "DEBUG=True" >> config.env
    echo "MAX_FILE_SIZE=10485760" >> config.env
    echo "UPLOAD_DIR=uploads" >> config.env
    echo "ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000" >> config.env
fi

# Create uploads directory
mkdir -p uploads

echo "🚀 Starting the application..."
echo "📁 Upload directory: $(pwd)/uploads"
echo "🌐 Server will be available at: http://localhost:8000"
echo "📚 API documentation at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the backend
python3 run_backend.py 