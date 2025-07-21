#!/bin/bash

echo "🚀 Starting Exoplanet Explorer Backend..."

# Navigate to backend directory
cd backend

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install requirements
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Start the Flask backend
echo "🌟 Starting Flask backend on http://localhost:5000..."
python3 app.py